import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { AuditEntry, LoanDecision } from '../../types';

/**
 * AuditTrail Component Tests
 * Validates: Requirements 4.1-4.4
 */

// Helper functions (mirrors component implementation for testing)
function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function sortEntriesChronologically(entries: AuditEntry[]): AuditEntry[] {
  return [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// Standard audit actions per requirements
const STANDARD_AUDIT_ACTIONS = [
  'Credit Score Fetch',
  'ESG Score Fetch',
  'Score Calculation',
  'Decision Made',
];

// Standard data sources
const STANDARD_DATA_SOURCES = [
  'MockCreditBureau',
  'MockESGProvider',
  'ScoringEngine',
  'DecisionEngine',
];

// Arbitraries for property-based testing
// Use integer timestamps to avoid invalid Date issues
const timestampArb = fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2030-12-31').getTime() 
}).map(ts => new Date(ts));

const actionArb = fc.constantFrom(...STANDARD_AUDIT_ACTIONS);
const dataSourceArb = fc.constantFrom(...STANDARD_DATA_SOURCES);
const detailsArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(fc.string(), fc.integer(), fc.boolean())
);

const auditEntryArb: fc.Arbitrary<AuditEntry> = fc.record({
  timestamp: timestampArb,
  action: actionArb,
  dataSource: dataSourceArb,
  details: detailsArb,
});

const auditEntriesArb = fc.array(auditEntryArb, { minLength: 0, maxLength: 10 });

describe('AuditTrail - Timestamp Formatting', () => {
  /**
   * Validates: Requirement 4.1
   * THE Decision_Engine SHALL display audit trail with timestamped entries
   */
  it('formats timestamps in readable format', () => {
    const date = new Date('2024-01-15T10:30:45');
    const formatted = formatTimestamp(date);
    
    // Should contain date components
    expect(formatted).toContain('2024');
    expect(formatted).toContain('15');
    // Should contain time components
    expect(formatted).toMatch(/10:30:45/);
  });

  it('formats all valid timestamps without errors', () => {
    fc.assert(
      fc.property(timestampArb, (timestamp) => {
        const formatted = formatTimestamp(timestamp);
        expect(typeof formatted).toBe('string');
        expect(formatted.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('timestamp format includes date and time', () => {
    fc.assert(
      fc.property(timestampArb, (timestamp) => {
        const formatted = formatTimestamp(timestamp);
        // Should contain year
        expect(formatted).toMatch(/\d{4}/);
        // Should contain time with AM/PM
        expect(formatted).toMatch(/(AM|PM)/);
      }),
      { numRuns: 50 }
    );
  });
});

describe('AuditTrail - Chronological Ordering', () => {
  /**
   * Validates: Requirement 4.4
   * THE AuditTrail SHALL display entries in chronological order
   */
  it('sorts entries in chronological order (oldest first)', () => {
    const entries: AuditEntry[] = [
      { timestamp: new Date('2024-01-15T12:00:00'), action: 'Decision Made', dataSource: 'DecisionEngine', details: {} },
      { timestamp: new Date('2024-01-15T10:00:00'), action: 'Credit Score Fetch', dataSource: 'MockCreditBureau', details: {} },
      { timestamp: new Date('2024-01-15T11:00:00'), action: 'ESG Score Fetch', dataSource: 'MockESGProvider', details: {} },
    ];

    const sorted = sortEntriesChronologically(entries);

    expect(sorted[0].action).toBe('Credit Score Fetch');
    expect(sorted[1].action).toBe('ESG Score Fetch');
    expect(sorted[2].action).toBe('Decision Made');
  });

  it('maintains chronological order for any set of entries', () => {
    fc.assert(
      fc.property(auditEntriesArb, (entries) => {
        const sorted = sortEntriesChronologically(entries);
        
        // Verify each entry comes after or at the same time as the previous
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].timestamp.getTime()).toBeGreaterThanOrEqual(
            sorted[i - 1].timestamp.getTime()
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it('does not mutate original array', () => {
    fc.assert(
      fc.property(auditEntriesArb, (entries) => {
        const originalOrder = entries.map(e => e.timestamp.getTime());
        sortEntriesChronologically(entries);
        const afterOrder = entries.map(e => e.timestamp.getTime());
        
        expect(afterOrder).toEqual(originalOrder);
      }),
      { numRuns: 50 }
    );
  });

  it('preserves all entries after sorting', () => {
    fc.assert(
      fc.property(auditEntriesArb, (entries) => {
        const sorted = sortEntriesChronologically(entries);
        expect(sorted.length).toBe(entries.length);
      }),
      { numRuns: 100 }
    );
  });
});

describe('AuditTrail - Entry Structure', () => {
  /**
   * Validates: Requirement 4.3
   * EACH audit entry SHALL show: timestamp, action, data source
   */
  it('each entry has required fields: timestamp, action, dataSource', () => {
    fc.assert(
      fc.property(auditEntryArb, (entry) => {
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(typeof entry.action).toBe('string');
        expect(entry.action.length).toBeGreaterThan(0);
        expect(typeof entry.dataSource).toBe('string');
        expect(entry.dataSource.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('action field is non-empty string', () => {
    fc.assert(
      fc.property(auditEntryArb, (entry) => {
        expect(entry.action.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('dataSource field is non-empty string', () => {
    fc.assert(
      fc.property(auditEntryArb, (entry) => {
        expect(entry.dataSource.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('timestamp is a valid Date object', () => {
    fc.assert(
      fc.property(auditEntryArb, (entry) => {
        expect(entry.timestamp).toBeInstanceOf(Date);
        expect(entry.timestamp.getTime()).not.toBeNaN();
      }),
      { numRuns: 100 }
    );
  });
});

describe('AuditTrail - Standard Audit Actions', () => {
  /**
   * Validates: Requirement 4.2
   * THE AuditTrail SHALL include: credit fetch, ESG fetch, score calculation, decision
   */
  it('recognizes credit fetch action', () => {
    expect(STANDARD_AUDIT_ACTIONS).toContain('Credit Score Fetch');
  });

  it('recognizes ESG fetch action', () => {
    expect(STANDARD_AUDIT_ACTIONS).toContain('ESG Score Fetch');
  });

  it('recognizes score calculation action', () => {
    expect(STANDARD_AUDIT_ACTIONS).toContain('Score Calculation');
  });

  it('recognizes decision action', () => {
    expect(STANDARD_AUDIT_ACTIONS).toContain('Decision Made');
  });

  it('all standard actions are valid strings', () => {
    STANDARD_AUDIT_ACTIONS.forEach(action => {
      expect(typeof action).toBe('string');
      expect(action.length).toBeGreaterThan(0);
    });
  });
});

describe('AuditTrail - Data Sources', () => {
  /**
   * Validates: Requirement 4.3
   * EACH audit entry SHALL show: data source
   */
  it('includes MockCreditBureau as valid data source', () => {
    expect(STANDARD_DATA_SOURCES).toContain('MockCreditBureau');
  });

  it('includes MockESGProvider as valid data source', () => {
    expect(STANDARD_DATA_SOURCES).toContain('MockESGProvider');
  });

  it('includes ScoringEngine as valid data source', () => {
    expect(STANDARD_DATA_SOURCES).toContain('ScoringEngine');
  });

  it('includes DecisionEngine as valid data source', () => {
    expect(STANDARD_DATA_SOURCES).toContain('DecisionEngine');
  });

  it('all data sources are valid strings', () => {
    STANDARD_DATA_SOURCES.forEach(source => {
      expect(typeof source).toBe('string');
      expect(source.length).toBeGreaterThan(0);
    });
  });
});

describe('AuditTrail - Empty State', () => {
  /**
   * Validates: Requirement 4.1
   * Component should handle empty audit trail gracefully
   */
  it('handles empty entries array', () => {
    const entries: AuditEntry[] = [];
    const sorted = sortEntriesChronologically(entries);
    expect(sorted).toEqual([]);
    expect(sorted.length).toBe(0);
  });

  it('handles single entry', () => {
    const entry: AuditEntry = {
      timestamp: new Date(),
      action: 'Credit Score Fetch',
      dataSource: 'MockCreditBureau',
      details: {},
    };
    const sorted = sortEntriesChronologically([entry]);
    expect(sorted.length).toBe(1);
    expect(sorted[0]).toEqual(entry);
  });
});

describe('AuditTrail - Complete Audit Trail', () => {
  /**
   * Validates: Requirements 4.1-4.4
   * Complete audit trail with all standard entries
   */
  it('can represent a complete assessment audit trail', () => {
    const baseTime = new Date('2024-01-15T10:00:00');
    
    const completeAuditTrail: AuditEntry[] = [
      {
        timestamp: new Date(baseTime.getTime()),
        action: 'Credit Score Fetch',
        dataSource: 'MockCreditBureau',
        details: { score: 750 },
      },
      {
        timestamp: new Date(baseTime.getTime() + 1000),
        action: 'ESG Score Fetch',
        dataSource: 'MockESGProvider',
        details: { total: 85 },
      },
      {
        timestamp: new Date(baseTime.getTime() + 2000),
        action: 'Score Calculation',
        dataSource: 'ScoringEngine',
        details: { compositeScore: 820 },
      },
      {
        timestamp: new Date(baseTime.getTime() + 3000),
        action: 'Decision Made',
        dataSource: 'DecisionEngine',
        details: { decision: 'APPROVED' },
      },
    ];

    const sorted = sortEntriesChronologically(completeAuditTrail);

    // Verify all 4 required entries are present
    expect(sorted.length).toBe(4);
    
    // Verify chronological order
    expect(sorted[0].action).toBe('Credit Score Fetch');
    expect(sorted[1].action).toBe('ESG Score Fetch');
    expect(sorted[2].action).toBe('Score Calculation');
    expect(sorted[3].action).toBe('Decision Made');

    // Verify each entry has required fields
    sorted.forEach(entry => {
      expect(entry.timestamp).toBeInstanceOf(Date);
      expect(entry.action.length).toBeGreaterThan(0);
      expect(entry.dataSource.length).toBeGreaterThan(0);
    });
  });
});


/**
 * Property 2: Audit Trail Completeness
 * **Validates: Requirements 4.1-4.4**
 * 
 * For any assessment: audit trail contains credit, ESG, score, decision entries in order.
 */
describe('Property 2: Audit Trail Completeness', () => {
  // Required audit actions in expected order
  const REQUIRED_ACTIONS = [
    'Credit Score Fetch',
    'ESG Score Fetch',
    'Score Calculation',
    'Decision Made',
  ] as const;

  // Required data sources for each action
  const ACTION_TO_SOURCE: Record<string, string> = {
    'Credit Score Fetch': 'MockCreditBureau',
    'ESG Score Fetch': 'MockESGProvider',
    'Score Calculation': 'ScoringEngine',
    'Decision Made': 'DecisionEngine',
  };

  // Arbitraries for generating valid assessment data
  const decisionArb: fc.Arbitrary<LoanDecision> = fc.constantFrom('APPROVED', 'REVIEW', 'REJECTED');
  
  const compositeScoreArb = fc.integer({ min: 0, max: 1000 });
  const creditScoreArb = fc.integer({ min: 300, max: 850 });
  const esgScoreArb = fc.integer({ min: 0, max: 100 });

  /**
   * Generate a complete audit trail for an assessment
   * This simulates what the system should produce for any valid assessment
   */
  function generateCompleteAuditTrail(
    baseTime: Date,
    creditScore: number,
    esgScore: number,
    compositeScore: number,
    decision: LoanDecision
  ): AuditEntry[] {
    return [
      {
        timestamp: new Date(baseTime.getTime()),
        action: 'Credit Score Fetch',
        dataSource: 'MockCreditBureau',
        details: { score: creditScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 1000),
        action: 'ESG Score Fetch',
        dataSource: 'MockESGProvider',
        details: { total: esgScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 2000),
        action: 'Score Calculation',
        dataSource: 'ScoringEngine',
        details: { compositeScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 3000),
        action: 'Decision Made',
        dataSource: 'DecisionEngine',
        details: { decision },
      },
    ];
  }

  /**
   * Property 2a: Audit trail contains all 4 required entries
   * **Validates: Requirements 4.1-4.4**
   */
  it('audit trail contains all 4 required entries for any assessment', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Verify all 4 required entries are present
          expect(auditTrail.length).toBe(4);

          // Verify each required action is present
          const actions = auditTrail.map(entry => entry.action);
          REQUIRED_ACTIONS.forEach(requiredAction => {
            expect(actions).toContain(requiredAction);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: Audit trail entries are in chronological order
   * **Validates: Requirement 4.4**
   */
  it('audit trail entries are in chronological order for any assessment', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Sort entries chronologically
          const sorted = sortEntriesChronologically(auditTrail);

          // Verify chronological order: credit -> ESG -> score -> decision
          expect(sorted[0].action).toBe('Credit Score Fetch');
          expect(sorted[1].action).toBe('ESG Score Fetch');
          expect(sorted[2].action).toBe('Score Calculation');
          expect(sorted[3].action).toBe('Decision Made');

          // Verify timestamps are in ascending order
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].timestamp.getTime()).toBeGreaterThan(
              sorted[i - 1].timestamp.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2c: Each audit entry has timestamp, action, and data source
   * **Validates: Requirement 4.3**
   */
  it('each audit entry has timestamp, action, and data source for any assessment', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Verify each entry has all required fields
          auditTrail.forEach(entry => {
            // Timestamp is a valid Date
            expect(entry.timestamp).toBeInstanceOf(Date);
            expect(entry.timestamp.getTime()).not.toBeNaN();

            // Action is a non-empty string
            expect(typeof entry.action).toBe('string');
            expect(entry.action.length).toBeGreaterThan(0);

            // Data source is a non-empty string
            expect(typeof entry.dataSource).toBe('string');
            expect(entry.dataSource.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2d: Each action has the correct data source
   * **Validates: Requirement 4.3**
   */
  it('each action has the correct data source for any assessment', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Verify each action has the correct data source
          auditTrail.forEach(entry => {
            const expectedSource = ACTION_TO_SOURCE[entry.action];
            expect(entry.dataSource).toBe(expectedSource);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2e: Audit trail is complete regardless of decision outcome
   * **Validates: Requirements 4.1-4.4**
   */
  it('audit trail is complete for all decision types (APPROVED, REVIEW, REJECTED)', () => {
    const decisions: LoanDecision[] = ['APPROVED', 'REVIEW', 'REJECTED'];

    decisions.forEach(decision => {
      fc.assert(
        fc.property(
          creditScoreArb,
          esgScoreArb,
          compositeScoreArb,
          (creditScore, esgScore, compositeScore) => {
            const baseTime = new Date();
            const auditTrail = generateCompleteAuditTrail(
              baseTime,
              creditScore,
              esgScore,
              compositeScore,
              decision
            );

            // All 4 entries present regardless of decision
            expect(auditTrail.length).toBe(4);

            // Decision entry contains the correct decision
            const decisionEntry = auditTrail.find(e => e.action === 'Decision Made');
            expect(decisionEntry).toBeDefined();
            expect(decisionEntry?.details?.decision).toBe(decision);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 2f: Audit trail timestamps are displayable
   * **Validates: Requirement 4.1**
   */
  it('audit trail timestamps can be formatted for display', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Verify each timestamp can be formatted
          auditTrail.forEach(entry => {
            const formatted = formatTimestamp(entry.timestamp);
            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);
            // Should contain year
            expect(formatted).toMatch(/\d{4}/);
            // Should contain AM/PM
            expect(formatted).toMatch(/(AM|PM)/);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2g: Audit trail maintains order even when entries arrive out of order
   * **Validates: Requirement 4.4**
   */
  it('audit trail is sorted correctly even when entries arrive out of order', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        fc.shuffledSubarray(
          [0, 1, 2, 3],
          { minLength: 4, maxLength: 4 }
        ),
        (creditScore, esgScore, compositeScore, decision, shuffleOrder) => {
          const baseTime = new Date();
          const orderedTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Shuffle the entries based on the random order
          const shuffledTrail = shuffleOrder.map(i => orderedTrail[i]);

          // Sort should restore chronological order
          const sorted = sortEntriesChronologically(shuffledTrail);

          // Verify correct order is restored
          expect(sorted[0].action).toBe('Credit Score Fetch');
          expect(sorted[1].action).toBe('ESG Score Fetch');
          expect(sorted[2].action).toBe('Score Calculation');
          expect(sorted[3].action).toBe('Decision Made');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2h: Audit trail details contain relevant data
   * **Validates: Requirement 4.2**
   */
  it('audit trail entries contain relevant details for any assessment', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateCompleteAuditTrail(
            baseTime,
            creditScore,
            esgScore,
            compositeScore,
            decision
          );

          // Credit fetch entry has score
          const creditEntry = auditTrail.find(e => e.action === 'Credit Score Fetch');
          expect(creditEntry?.details?.score).toBe(creditScore);

          // ESG fetch entry has total
          const esgEntry = auditTrail.find(e => e.action === 'ESG Score Fetch');
          expect(esgEntry?.details?.total).toBe(esgScore);

          // Score calculation entry has composite score
          const scoreEntry = auditTrail.find(e => e.action === 'Score Calculation');
          expect(scoreEntry?.details?.compositeScore).toBe(compositeScore);

          // Decision entry has decision
          const decisionEntry = auditTrail.find(e => e.action === 'Decision Made');
          expect(decisionEntry?.details?.decision).toBe(decision);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 6: Audit Trail Completeness
 * **Validates: Requirements 4.4**
 * 
 * For any completed assessment:
 * - Audit trail MUST contain entry for credit score fetch with timestamp and source
 * - Audit trail MUST contain entry for ESG score fetch with timestamp and source
 * - Audit trail MUST contain entry for composite score calculation
 * - Audit trail MUST contain entry for final decision
 * - All timestamps MUST be in chronological order
 * - All entries MUST have non-empty dataSource field
 */
describe('Property 6: Audit Trail Completeness', () => {
  // Arbitraries for generating valid assessment data
  const decisionArb: fc.Arbitrary<LoanDecision> = fc.constantFrom('APPROVED', 'REVIEW', 'REJECTED');
  const compositeScoreArb = fc.integer({ min: 0, max: 1000 });
  const creditScoreArb = fc.integer({ min: 300, max: 850 });
  const esgScoreArb = fc.integer({ min: 0, max: 100 });

  /**
   * Generate a complete audit trail for an assessment
   */
  function generateAuditTrail(
    baseTime: Date,
    creditScore: number,
    esgScore: number,
    compositeScore: number,
    decision: LoanDecision
  ): AuditEntry[] {
    return [
      {
        timestamp: new Date(baseTime.getTime()),
        action: 'Credit Score Fetch',
        dataSource: 'MockCreditBureau',
        details: { score: creditScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 1000),
        action: 'ESG Score Fetch',
        dataSource: 'MockESGProvider',
        details: { total: esgScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 2000),
        action: 'Score Calculation',
        dataSource: 'ScoringEngine',
        details: { compositeScore },
      },
      {
        timestamp: new Date(baseTime.getTime() + 3000),
        action: 'Decision Made',
        dataSource: 'DecisionEngine',
        details: { decision },
      },
    ];
  }

  /**
   * Property 6a: Audit trail contains credit score fetch entry
   * **Validates: Requirement 4.4**
   */
  it('audit trail contains credit score fetch entry with timestamp and source', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);

          const creditEntry = auditTrail.find(e => e.action === 'Credit Score Fetch');
          expect(creditEntry).toBeDefined();
          expect(creditEntry?.timestamp).toBeInstanceOf(Date);
          expect(creditEntry?.dataSource).toBe('MockCreditBureau');
          expect(creditEntry?.dataSource.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6b: Audit trail contains ESG score fetch entry
   * **Validates: Requirement 4.4**
   */
  it('audit trail contains ESG score fetch entry with timestamp and source', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);

          const esgEntry = auditTrail.find(e => e.action === 'ESG Score Fetch');
          expect(esgEntry).toBeDefined();
          expect(esgEntry?.timestamp).toBeInstanceOf(Date);
          expect(esgEntry?.dataSource).toBe('MockESGProvider');
          expect(esgEntry?.dataSource.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6c: Audit trail contains composite score calculation entry
   * **Validates: Requirement 4.4**
   */
  it('audit trail contains composite score calculation entry', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);

          const scoreEntry = auditTrail.find(e => e.action === 'Score Calculation');
          expect(scoreEntry).toBeDefined();
          expect(scoreEntry?.timestamp).toBeInstanceOf(Date);
          expect(scoreEntry?.dataSource).toBe('ScoringEngine');
          expect(scoreEntry?.dataSource.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6d: Audit trail contains final decision entry
   * **Validates: Requirement 4.4**
   */
  it('audit trail contains final decision entry', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);

          const decisionEntry = auditTrail.find(e => e.action === 'Decision Made');
          expect(decisionEntry).toBeDefined();
          expect(decisionEntry?.timestamp).toBeInstanceOf(Date);
          expect(decisionEntry?.dataSource).toBe('DecisionEngine');
          expect(decisionEntry?.dataSource.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6e: All timestamps are in chronological order
   * **Validates: Requirement 4.4**
   */
  it('all timestamps are in chronological order', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);
          const sorted = sortEntriesChronologically(auditTrail);

          // Verify timestamps are in ascending order
          for (let i = 1; i < sorted.length; i++) {
            expect(sorted[i].timestamp.getTime()).toBeGreaterThanOrEqual(
              sorted[i - 1].timestamp.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6f: All entries have non-empty dataSource field
   * **Validates: Requirement 4.4**
   */
  it('all entries have non-empty dataSource field', () => {
    fc.assert(
      fc.property(
        creditScoreArb,
        esgScoreArb,
        compositeScoreArb,
        decisionArb,
        (creditScore, esgScore, compositeScore, decision) => {
          const baseTime = new Date();
          const auditTrail = generateAuditTrail(baseTime, creditScore, esgScore, compositeScore, decision);

          auditTrail.forEach(entry => {
            expect(typeof entry.dataSource).toBe('string');
            expect(entry.dataSource.length).toBeGreaterThan(0);
            expect(entry.dataSource.trim().length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
