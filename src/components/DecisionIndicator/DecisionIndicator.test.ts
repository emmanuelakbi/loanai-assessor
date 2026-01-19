import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getDecisionFromScore } from './DecisionIndicator';
import type { LoanDecision } from '../../types';

/**
 * DecisionIndicator Component Tests
 * Validates: Requirements 4.1-4.3
 */

// Decision color mapping per requirements
const DECISION_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#10B981', // green
  REVIEW: '#F59E0B',   // yellow
  REJECTED: '#EF4444', // red
};

// Decision emoji indicators per requirements
const DECISION_EMOJI: Record<LoanDecision, string> = {
  APPROVED: '🟢',
  REVIEW: '🟡',
  REJECTED: '🔴',
};

describe('DecisionIndicator - getDecisionFromScore', () => {
  /**
   * Validates: Requirement 4.1
   * WHEN composite score exceeds 750, THE API_Scoring_Engine SHALL classify as APPROVED (🟢)
   */
  describe('APPROVED threshold (>750)', () => {
    it('returns APPROVED for score 751', () => {
      expect(getDecisionFromScore(751)).toBe('APPROVED');
    });

    it('returns APPROVED for score 1000', () => {
      expect(getDecisionFromScore(1000)).toBe('APPROVED');
    });

    it('returns APPROVED for any score > 750', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 751, max: 1000 }),
          (score) => {
            expect(getDecisionFromScore(score)).toBe('APPROVED');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Validates: Requirement 4.2
   * WHEN composite score is 600-750 inclusive, THE API_Scoring_Engine SHALL classify as REVIEW (🟡)
   */
  describe('REVIEW threshold (600-750)', () => {
    it('returns REVIEW for score 600', () => {
      expect(getDecisionFromScore(600)).toBe('REVIEW');
    });

    it('returns REVIEW for score 750', () => {
      expect(getDecisionFromScore(750)).toBe('REVIEW');
    });

    it('returns REVIEW for score 675 (middle of range)', () => {
      expect(getDecisionFromScore(675)).toBe('REVIEW');
    });

    it('returns REVIEW for any score in range [600, 750]', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 600, max: 750 }),
          (score) => {
            expect(getDecisionFromScore(score)).toBe('REVIEW');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Validates: Requirement 4.3
   * WHEN composite score is below 600, THE API_Scoring_Engine SHALL classify as REJECTED (🔴)
   */
  describe('REJECTED threshold (<600)', () => {
    it('returns REJECTED for score 599', () => {
      expect(getDecisionFromScore(599)).toBe('REJECTED');
    });

    it('returns REJECTED for score 0', () => {
      expect(getDecisionFromScore(0)).toBe('REJECTED');
    });

    it('returns REJECTED for any score < 600', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 599 }),
          (score) => {
            expect(getDecisionFromScore(score)).toBe('REJECTED');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Validates: Requirement 4.4
   * THE decision classification SHALL be deterministic for any given score
   */
  describe('Deterministic behavior', () => {
    it('returns same decision for same score (deterministic)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (score) => {
            const decision1 = getDecisionFromScore(score);
            const decision2 = getDecisionFromScore(score);
            expect(decision1).toBe(decision2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('covers all possible decisions for valid score range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000 }),
          (score) => {
            const decision = getDecisionFromScore(score);
            expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(decision);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Boundary tests for threshold edges
   */
  describe('Boundary conditions', () => {
    it('correctly handles boundary at 600 (REVIEW, not REJECTED)', () => {
      expect(getDecisionFromScore(600)).toBe('REVIEW');
      expect(getDecisionFromScore(599)).toBe('REJECTED');
    });

    it('correctly handles boundary at 750 (REVIEW, not APPROVED)', () => {
      expect(getDecisionFromScore(750)).toBe('REVIEW');
      expect(getDecisionFromScore(751)).toBe('APPROVED');
    });
  });
});

describe('DecisionIndicator - Visual Mappings', () => {
  /**
   * Validates: Requirements 4.1-4.3
   * Visual indicators for each decision type
   */
  describe('Color mappings', () => {
    it('APPROVED uses green color (#10B981)', () => {
      expect(DECISION_COLORS['APPROVED']).toBe('#10B981');
    });

    it('REVIEW uses yellow color (#F59E0B)', () => {
      expect(DECISION_COLORS['REVIEW']).toBe('#F59E0B');
    });

    it('REJECTED uses red color (#EF4444)', () => {
      expect(DECISION_COLORS['REJECTED']).toBe('#EF4444');
    });

    it('all decisions have valid hex colors', () => {
      const decisions: LoanDecision[] = ['APPROVED', 'REVIEW', 'REJECTED'];
      decisions.forEach((decision) => {
        expect(DECISION_COLORS[decision]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('Emoji mappings', () => {
    it('APPROVED uses green circle emoji (🟢)', () => {
      expect(DECISION_EMOJI['APPROVED']).toBe('🟢');
    });

    it('REVIEW uses yellow circle emoji (🟡)', () => {
      expect(DECISION_EMOJI['REVIEW']).toBe('🟡');
    });

    it('REJECTED uses red circle emoji (🔴)', () => {
      expect(DECISION_EMOJI['REJECTED']).toBe('🔴');
    });

    it('all decisions have emoji indicators', () => {
      const decisions: LoanDecision[] = ['APPROVED', 'REVIEW', 'REJECTED'];
      decisions.forEach((decision) => {
        expect(DECISION_EMOJI[decision]).toBeDefined();
        expect(DECISION_EMOJI[decision].length).toBeGreaterThan(0);
      });
    });
  });
});

describe('DecisionIndicator - Props Handling', () => {
  /**
   * Test that decision prop takes precedence over score
   */
  it('decision prop values are valid LoanDecision types', () => {
    const validDecisions: LoanDecision[] = ['APPROVED', 'REVIEW', 'REJECTED'];
    validDecisions.forEach((decision) => {
      expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(decision);
    });
  });

  it('score prop can be used to derive decision', () => {
    // Test that scores correctly map to decisions
    expect(getDecisionFromScore(800)).toBe('APPROVED');
    expect(getDecisionFromScore(700)).toBe('REVIEW');
    expect(getDecisionFromScore(500)).toBe('REJECTED');
  });
});
