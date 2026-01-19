import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateLoanTerms,
  calculateIncomeMultiplier,
  calculateInterestRate,
  calculateMonthlyPayment,
} from './loanTermsEngine';

/**
 * Property 1: Loan Terms Generation
 * Validates: Requirements 2.1-2.5
 * 
 * For any APPROVED assessment: loanTerms defined, all values positive, payment matches formula.
 */
describe('Property 1: Loan Terms Generation', () => {
  // Arbitraries for valid input ranges
  const compositeScoreArb = fc.integer({ min: 751, max: 1000 }); // APPROVED range
  const annualIncomeArb = fc.integer({ min: 30000, max: 500000 });

  /**
   * Property 1a: Loan terms are only generated for APPROVED decisions
   * Validates: Requirement 2.1
   */
  it('loan terms are only generated for APPROVED decisions', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        
        const reviewTerms = calculateLoanTerms(score, income, 'REVIEW');
        expect(reviewTerms).toBeNull();
        
        const rejectedTerms = calculateLoanTerms(score, income, 'REJECTED');
        expect(rejectedTerms).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1b: All loan term values are positive
   * Validates: Requirements 2.2-2.5
   */
  it('all loan term values are positive for approved loans', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.principalAmount).toBeGreaterThan(0);
          expect(terms.interestRate).toBeGreaterThan(0);
          expect(terms.termMonths).toBeGreaterThan(0);
          expect(terms.monthlyPayment).toBeGreaterThan(0);
          expect(terms.totalInterest).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1c: Principal is calculated based on income multiplier (2.0-3.0x)
   * Validates: Requirement 2.3
   */
  it('principal is within income multiplier range (2.0-3.0x)', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          const minPrincipal = income * 2.0;
          const maxPrincipal = income * 3.0;
          expect(terms.principalAmount).toBeGreaterThanOrEqual(minPrincipal);
          expect(terms.principalAmount).toBeLessThanOrEqual(maxPrincipal);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1d: Interest rate is base rate plus risk premium
   * Validates: Requirement 2.4
   */
  it('interest rate is base 5.0% plus risk premium', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          // Base rate is 5.0%, risk premium is (850 - score) / 100
          // For approved loans (score > 750), rate should be between 5.0% and ~6.0%
          expect(terms.interestRate).toBeGreaterThanOrEqual(5.0);
          expect(terms.interestRate).toBeLessThanOrEqual(6.0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1e: Monthly payment matches amortization formula
   * Validates: Requirement 2.5
   */
  it('monthly payment matches amortization formula', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          const expectedPayment = calculateMonthlyPayment(
            terms.principalAmount,
            terms.interestRate,
            terms.termMonths
          );
          expect(terms.monthlyPayment).toBeCloseTo(expectedPayment, 2);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1f: Total interest equals (monthly payment * term) - principal
   * Validates: Requirement 2.2
   */
  it('total interest is correctly calculated', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          const expectedTotalInterest = (terms.monthlyPayment * terms.termMonths) - terms.principalAmount;
          expect(terms.totalInterest).toBeCloseTo(expectedTotalInterest, 2);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1g: Income multiplier is correctly tiered by score
   * Validates: Requirement 2.3
   */
  it('income multiplier is correctly tiered by score', () => {
    // Score > 800 gets 3.0x
    expect(calculateIncomeMultiplier(801)).toBe(3.0);
    expect(calculateIncomeMultiplier(900)).toBe(3.0);
    
    // Score 701-800 gets 2.5x
    expect(calculateIncomeMultiplier(701)).toBe(2.5);
    expect(calculateIncomeMultiplier(800)).toBe(2.5);
    
    // Score <= 700 gets 2.0x
    expect(calculateIncomeMultiplier(700)).toBe(2.0);
    expect(calculateIncomeMultiplier(600)).toBe(2.0);
  });

  /**
   * Property 1h: Higher scores result in better terms (lower rates, higher principal)
   * Validates: Requirements 2.3, 2.4
   */
  it('higher scores result in better loan terms', () => {
    fc.assert(
      fc.property(annualIncomeArb, (income) => {
        const highScoreTerms = calculateLoanTerms(900, income, 'APPROVED');
        const lowScoreTerms = calculateLoanTerms(760, income, 'APPROVED');
        
        expect(highScoreTerms).not.toBeNull();
        expect(lowScoreTerms).not.toBeNull();
        
        if (highScoreTerms && lowScoreTerms) {
          // Higher score should get lower interest rate
          expect(highScoreTerms.interestRate).toBeLessThanOrEqual(lowScoreTerms.interestRate);
          // Higher score should get higher principal (better multiplier)
          expect(highScoreTerms.principalAmount).toBeGreaterThanOrEqual(lowScoreTerms.principalAmount);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1i: Term is always 360 months (30 years)
   * Validates: Requirement 2.2
   */
  it('loan term is always 360 months', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.termMonths).toBe(360);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 1j: Generated timestamp is present
   * Validates: Requirement 2.2
   */
  it('loan terms include generation timestamp', () => {
    fc.assert(
      fc.property(compositeScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.generatedAt).toBeInstanceOf(Date);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Interest Rate Calculation Tests
 */
describe('Interest Rate Calculation', () => {
  it('interest rate decreases as score increases', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 600, max: 849 }),
        (score) => {
          const lowerRate = calculateInterestRate(score + 1);
          const higherRate = calculateInterestRate(score);
          expect(lowerRate).toBeLessThanOrEqual(higherRate);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('interest rate is always at least base rate (5.0%)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (score) => {
        const rate = calculateInterestRate(score);
        expect(rate).toBeGreaterThanOrEqual(5.0);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Monthly Payment Calculation Tests
 */
describe('Monthly Payment Calculation', () => {
  it('monthly payment is positive for positive inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 1000000 }),
        fc.float({ min: 1, max: 20, noNaN: true }),
        fc.integer({ min: 12, max: 360 }),
        (principal, rate, term) => {
          const payment = calculateMonthlyPayment(principal, rate, term);
          expect(payment).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('total payments exceed principal (interest is paid)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 1000000 }),
        fc.float({ min: 1, max: 20, noNaN: true }),
        fc.integer({ min: 12, max: 360 }),
        (principal, rate, term) => {
          const payment = calculateMonthlyPayment(principal, rate, term);
          const totalPayments = payment * term;
          expect(totalPayments).toBeGreaterThan(principal);
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 7: Loan Terms Generation for Approved Loans
 * **Validates: Requirements 4.2**
 * 
 * For any assessment with decision 'APPROVED':
 * - loanTerms MUST be defined (not null/undefined)
 * - loanTerms.principalAmount MUST be > 0
 * - loanTerms.interestRate MUST be in range [0, 100]
 * - loanTerms.termMonths MUST be > 0
 * - loanTerms.monthlyPayment MUST equal calculated payment using standard amortization formula
 * 
 * For any assessment with decision 'REVIEW' or 'REJECTED':
 * - loanTerms MAY be undefined
 */
describe('Property 7: Loan Terms Generation for Approved Loans', () => {
  // Arbitraries for valid input ranges
  const approvedScoreArb = fc.integer({ min: 751, max: 1000 }); // APPROVED range
  const reviewScoreArb = fc.integer({ min: 600, max: 750 }); // REVIEW range
  const rejectedScoreArb = fc.integer({ min: 0, max: 599 }); // REJECTED range
  const annualIncomeArb = fc.integer({ min: 30000, max: 500000 });

  /**
   * Property 7a: Loan terms are generated for APPROVED decisions
   * **Validates: Requirement 4.2**
   */
  it('loan terms are generated for APPROVED decisions', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        expect(terms).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7b: Principal amount is greater than 0
   * **Validates: Requirement 4.2**
   */
  it('principal amount is greater than 0 for approved loans', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.principalAmount).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7c: Interest rate is in valid range [0, 100]
   * **Validates: Requirement 4.2**
   */
  it('interest rate is in valid range [0, 100] for approved loans', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.interestRate).toBeGreaterThanOrEqual(0);
          expect(terms.interestRate).toBeLessThanOrEqual(100);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7d: Term months is greater than 0
   * **Validates: Requirement 4.2**
   */
  it('term months is greater than 0 for approved loans', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          expect(terms.termMonths).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7e: Monthly payment matches amortization formula
   * **Validates: Requirement 4.2**
   */
  it('monthly payment matches standard amortization formula', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          const expectedPayment = calculateMonthlyPayment(
            terms.principalAmount,
            terms.interestRate,
            terms.termMonths
          );
          expect(terms.monthlyPayment).toBeCloseTo(expectedPayment, 2);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7f: Loan terms may be undefined for REVIEW decisions
   * **Validates: Requirement 4.2**
   */
  it('loan terms are null for REVIEW decisions', () => {
    fc.assert(
      fc.property(reviewScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'REVIEW');
        expect(terms).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7g: Loan terms may be undefined for REJECTED decisions
   * **Validates: Requirement 4.2**
   */
  it('loan terms are null for REJECTED decisions', () => {
    fc.assert(
      fc.property(rejectedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'REJECTED');
        expect(terms).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7h: All loan term values are valid for any approved loan
   * **Validates: Requirement 4.2**
   */
  it('all loan term values are valid for any approved loan', () => {
    fc.assert(
      fc.property(approvedScoreArb, annualIncomeArb, (score, income) => {
        const terms = calculateLoanTerms(score, income, 'APPROVED');
        expect(terms).not.toBeNull();
        if (terms) {
          // All values must be defined
          expect(terms.principalAmount).toBeDefined();
          expect(terms.interestRate).toBeDefined();
          expect(terms.termMonths).toBeDefined();
          expect(terms.monthlyPayment).toBeDefined();
          expect(terms.totalInterest).toBeDefined();
          expect(terms.generatedAt).toBeDefined();

          // All numeric values must be positive
          expect(terms.principalAmount).toBeGreaterThan(0);
          expect(terms.interestRate).toBeGreaterThan(0);
          expect(terms.termMonths).toBeGreaterThan(0);
          expect(terms.monthlyPayment).toBeGreaterThan(0);
          expect(terms.totalInterest).toBeGreaterThan(0);

          // Generated timestamp must be a valid Date
          expect(terms.generatedAt).toBeInstanceOf(Date);
        }
      }),
      { numRuns: 100 }
    );
  });
});
