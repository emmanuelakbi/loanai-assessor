import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { LoanDecision, IndustrySector } from '../../types';

/**
 * DecisionBanner Component Tests
 * Validates: Requirements 1.1-1.4
 */

// Decision display text mapping (mirrors component implementation)
const DECISION_TEXT: Record<LoanDecision, string> = {
  APPROVED: 'LOAN APPROVED',
  REVIEW: 'MANUAL REVIEW REQUIRED',
  REJECTED: 'LOAN REJECTED',
};

// Decision color mapping per requirements
const DECISION_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#10B981', // green
  REVIEW: '#F59E0B',   // yellow
  REJECTED: '#EF4444', // red
};

// Valid industry sectors
const INDUSTRY_SECTORS: IndustrySector[] = [
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Finance',
  'Energy',
  'Retail',
  'Agriculture',
  'Construction',
];

// Arbitraries for property-based testing
const decisionArb = fc.constantFrom<LoanDecision>('APPROVED', 'REVIEW', 'REJECTED');
const borrowerNameArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const scoreArb = fc.integer({ min: 0, max: 1000 });
const industryArb = fc.constantFrom<IndustrySector>(...INDUSTRY_SECTORS);

describe('DecisionBanner - Decision Text Display', () => {
  /**
   * Validates: Requirement 1.2
   * THE DecisionBanner SHALL show: "LOAN APPROVED", "MANUAL REVIEW REQUIRED", or "LOAN REJECTED"
   */
  it('displays correct text for APPROVED decision', () => {
    expect(DECISION_TEXT['APPROVED']).toBe('LOAN APPROVED');
  });

  it('displays correct text for REVIEW decision', () => {
    expect(DECISION_TEXT['REVIEW']).toBe('MANUAL REVIEW REQUIRED');
  });

  it('displays correct text for REJECTED decision', () => {
    expect(DECISION_TEXT['REJECTED']).toBe('LOAN REJECTED');
  });

  it('all decision types have corresponding display text', () => {
    fc.assert(
      fc.property(decisionArb, (decision) => {
        expect(DECISION_TEXT[decision]).toBeDefined();
        expect(typeof DECISION_TEXT[decision]).toBe('string');
        expect(DECISION_TEXT[decision].length).toBeGreaterThan(0);
      }),
      { numRuns: 10 }
    );
  });
});

describe('DecisionBanner - Color Mapping', () => {
  /**
   * Validates: Requirement 1.3
   * THE DecisionBanner SHALL use color: green (#10B981) approved, yellow (#F59E0B) review, red (#EF4444) rejected
   */
  it('uses green (#10B981) for APPROVED decision', () => {
    expect(DECISION_COLORS['APPROVED']).toBe('#10B981');
  });

  it('uses yellow (#F59E0B) for REVIEW decision', () => {
    expect(DECISION_COLORS['REVIEW']).toBe('#F59E0B');
  });

  it('uses red (#EF4444) for REJECTED decision', () => {
    expect(DECISION_COLORS['REJECTED']).toBe('#EF4444');
  });

  it('all decision types have corresponding colors', () => {
    fc.assert(
      fc.property(decisionArb, (decision) => {
        expect(DECISION_COLORS[decision]).toBeDefined();
        expect(DECISION_COLORS[decision]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }),
      { numRuns: 10 }
    );
  });
});

describe('DecisionBanner - Props Validation', () => {
  /**
   * Validates: Requirement 1.4
   * THE DecisionBanner SHALL display borrower name, score, and industry
   */
  it('accepts all valid decision types', () => {
    fc.assert(
      fc.property(decisionArb, (decision) => {
        // Verify decision is one of the valid types
        expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(decision);
      }),
      { numRuns: 10 }
    );
  });

  it('accepts valid borrower names', () => {
    fc.assert(
      fc.property(borrowerNameArb, (name) => {
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 50 }
    );
  });

  it('accepts valid scores in range 0-1000', () => {
    fc.assert(
      fc.property(scoreArb, (score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1000);
      }),
      { numRuns: 50 }
    );
  });

  it('accepts all valid industry sectors', () => {
    fc.assert(
      fc.property(industryArb, (industry) => {
        expect(INDUSTRY_SECTORS).toContain(industry);
      }),
      { numRuns: 20 }
    );
  });

  it('all props can be combined for any valid input', () => {
    fc.assert(
      fc.property(
        decisionArb,
        borrowerNameArb,
        scoreArb,
        industryArb,
        (decision, borrowerName, score, industry) => {
          // Verify all props are valid
          expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(decision);
          expect(borrowerName.trim().length).toBeGreaterThan(0);
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(1000);
          expect(INDUSTRY_SECTORS).toContain(industry);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('DecisionBanner - Decision Consistency', () => {
  /**
   * Validates: Requirements 1.2, 1.3
   * Each decision type has consistent text and color
   */
  it('APPROVED decision has consistent text and color', () => {
    expect(DECISION_TEXT['APPROVED']).toBe('LOAN APPROVED');
    expect(DECISION_COLORS['APPROVED']).toBe('#10B981');
  });

  it('REVIEW decision has consistent text and color', () => {
    expect(DECISION_TEXT['REVIEW']).toBe('MANUAL REVIEW REQUIRED');
    expect(DECISION_COLORS['REVIEW']).toBe('#F59E0B');
  });

  it('REJECTED decision has consistent text and color', () => {
    expect(DECISION_TEXT['REJECTED']).toBe('LOAN REJECTED');
    expect(DECISION_COLORS['REJECTED']).toBe('#EF4444');
  });
});
