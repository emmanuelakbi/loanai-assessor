import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateCompositeScore,
  normalizeCreditScore,
  normalizeIncomeAssetsScore,
  normalizeESGScore,
  determineDecision,
} from './scoringEngine';

/**
 * Property 1: Composite Score Calculation Accuracy
 * Validates: Requirements 2.1-2.5
 * 
 * For any valid inputs, composite score SHALL be in [0, 1000] with correct weighted components.
 */
describe('Property 1: Composite Score Calculation Accuracy', () => {
  // Arbitraries for valid input ranges
  const creditScoreArb = fc.integer({ min: 300, max: 850 });
  const incomeScoreArb = fc.integer({ min: 0, max: 100 });
  const esgScoreArb = fc.integer({ min: 0, max: 100 });

  /**
   * Property 1a: Composite score is always in valid range [0, 1000]
   * Validates: Requirement 2.1
   */
  it('composite score is always in range [0, 1000]', () => {
    fc.assert(
      fc.property(creditScoreArb, incomeScoreArb, esgScoreArb, (credit, income, esg) => {
        const result = calculateCompositeScore(
          { score: credit },
          { score: income },
          { total: esg }
        );
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(1000);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: Credit component is correctly normalized to [0, 400]
   * Validates: Requirement 2.2
   */
  it('credit component is normalized to [0, 400] range', () => {
    fc.assert(
      fc.property(creditScoreArb, (credit) => {
        const component = normalizeCreditScore(credit);
        expect(component).toBeGreaterThanOrEqual(0);
        expect(component).toBeLessThanOrEqual(400);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1c: Income/assets component is correctly normalized to [0, 300]
   * Validates: Requirement 2.3
   */
  it('income/assets component is normalized to [0, 300] range', () => {
    fc.assert(
      fc.property(incomeScoreArb, (income) => {
        const component = normalizeIncomeAssetsScore(income);
        expect(component).toBeGreaterThanOrEqual(0);
        expect(component).toBeLessThanOrEqual(300);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1d: ESG component is correctly normalized to [0, 300]
   * Validates: Requirement 2.4
   */
  it('ESG component is normalized to [0, 300] range', () => {
    fc.assert(
      fc.property(esgScoreArb, (esg) => {
        const component = normalizeESGScore(esg);
        expect(component).toBeGreaterThanOrEqual(0);
        expect(component).toBeLessThanOrEqual(300);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1e: Composite score equals sum of all components
   * Validates: Requirement 2.1 (weighted formula)
   */
  it('composite score equals sum of all weighted components', () => {
    fc.assert(
      fc.property(creditScoreArb, incomeScoreArb, esgScoreArb, (credit, income, esg) => {
        const result = calculateCompositeScore(
          { score: credit },
          { score: income },
          { total: esg }
        );
        const expectedTotal = result.creditComponent + result.incomeComponent + result.esgComponent;
        expect(result.total).toBe(expectedTotal);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1f: Final composite score is always an integer
   * Validates: Requirement 2.5
   */
  it('composite score is always an integer', () => {
    fc.assert(
      fc.property(creditScoreArb, incomeScoreArb, esgScoreArb, (credit, income, esg) => {
        const result = calculateCompositeScore(
          { score: credit },
          { score: income },
          { total: esg }
        );
        expect(Number.isInteger(result.total)).toBe(true);
        expect(Number.isInteger(result.creditComponent)).toBe(true);
        expect(Number.isInteger(result.incomeComponent)).toBe(true);
        expect(Number.isInteger(result.esgComponent)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1g: Boundary values produce correct results
   * Validates: Requirements 2.2-2.4
   */
  it('boundary values produce correct component maximums', () => {
    // Maximum credit score (850) should produce 400 points
    expect(normalizeCreditScore(850)).toBe(400);
    // Minimum credit score (300) should produce 0 points
    expect(normalizeCreditScore(300)).toBe(0);
    
    // Maximum income score (100) should produce 300 points
    expect(normalizeIncomeAssetsScore(100)).toBe(300);
    // Minimum income score (0) should produce 0 points
    expect(normalizeIncomeAssetsScore(0)).toBe(0);
    
    // Maximum ESG score (100) should produce 300 points
    expect(normalizeESGScore(100)).toBe(300);
    // Minimum ESG score (0) should produce 0 points
    expect(normalizeESGScore(0)).toBe(0);
  });

  /**
   * Property 1h: Maximum possible score is 1000
   */
  it('maximum inputs produce score of 1000', () => {
    const result = calculateCompositeScore(
      { score: 850 },
      { score: 100 },
      { total: 100 }
    );
    expect(result.total).toBe(1000);
  });

  /**
   * Property 1i: Minimum possible score is 0
   */
  it('minimum inputs produce score of 0', () => {
    const result = calculateCompositeScore(
      { score: 300 },
      { score: 0 },
      { total: 0 }
    );
    expect(result.total).toBe(0);
  });
});

/**
 * Property 2: Decision Threshold Consistency
 * Validates: Requirements 4.1-4.4
 * 
 * For any score: >750=APPROVED, 600-750=REVIEW, <600=REJECTED
 */
describe('Property 2: Decision Threshold Consistency', () => {
  /**
   * Property 2a: Scores above 750 are APPROVED
   * Validates: Requirement 4.1
   */
  it('scores above 750 are classified as APPROVED', () => {
    fc.assert(
      fc.property(fc.integer({ min: 751, max: 1000 }), (score) => {
        const decision = determineDecision(score);
        expect(decision).toBe('APPROVED');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: Scores 600-750 inclusive are REVIEW
   * Validates: Requirement 4.2
   */
  it('scores 600-750 inclusive are classified as REVIEW', () => {
    fc.assert(
      fc.property(fc.integer({ min: 600, max: 750 }), (score) => {
        const decision = determineDecision(score);
        expect(decision).toBe('REVIEW');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2c: Scores below 600 are REJECTED
   * Validates: Requirement 4.3
   */
  it('scores below 600 are classified as REJECTED', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 599 }), (score) => {
        const decision = determineDecision(score);
        expect(decision).toBe('REJECTED');
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2d: Decision is deterministic for any given score
   * Validates: Requirement 4.4
   */
  it('decision is deterministic for any given score', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (score) => {
        const decision1 = determineDecision(score);
        const decision2 = determineDecision(score);
        expect(decision1).toBe(decision2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2e: Boundary values are correctly classified
   */
  it('boundary values are correctly classified', () => {
    // Exactly 750 should be REVIEW (600-750 inclusive)
    expect(determineDecision(750)).toBe('REVIEW');
    // 751 should be APPROVED
    expect(determineDecision(751)).toBe('APPROVED');
    // Exactly 600 should be REVIEW
    expect(determineDecision(600)).toBe('REVIEW');
    // 599 should be REJECTED
    expect(determineDecision(599)).toBe('REJECTED');
  });

  /**
   * Property 2f: Composite score calculation produces consistent decisions
   */
  it('composite score calculation produces consistent decisions', () => {
    const creditScoreArb = fc.integer({ min: 300, max: 850 });
    const incomeScoreArb = fc.integer({ min: 0, max: 100 });
    const esgScoreArb = fc.integer({ min: 0, max: 100 });

    fc.assert(
      fc.property(creditScoreArb, incomeScoreArb, esgScoreArb, (credit, income, esg) => {
        const result = calculateCompositeScore(
          { score: credit },
          { score: income },
          { total: esg }
        );
        
        // Verify decision matches the score
        const expectedDecision = determineDecision(result.total);
        expect(result.decision).toBe(expectedDecision);
      }),
      { numRuns: 100 }
    );
  });
});
