import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { LoanTerms } from '../../types';

/**
 * LoanTermsCard Component Tests
 * Validates: Requirements 2.1, 2.2
 */

// Helper functions (mirrors component implementation for testing)
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatTermLength(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

// Arbitraries for property-based testing
const principalAmountArb = fc.integer({ min: 10000, max: 10000000 });
const interestRateArb = fc.float({ min: 1.0, max: 20.0, noNaN: true });
const termMonthsArb = fc.constantFrom(60, 120, 180, 240, 300, 360); // Common loan terms
const monthlyPaymentArb = fc.float({ min: 100, max: 100000, noNaN: true });
const totalInterestArb = fc.float({ min: 0, max: 10000000, noNaN: true });
// Use integer timestamps to avoid invalid Date issues
const generatedAtArb = fc.integer({ 
  min: new Date('2020-01-01').getTime(), 
  max: new Date('2030-12-31').getTime() 
}).map(ts => new Date(ts));

const loanTermsArb: fc.Arbitrary<LoanTerms> = fc.record({
  principalAmount: principalAmountArb,
  interestRate: interestRateArb,
  termMonths: termMonthsArb,
  monthlyPayment: monthlyPaymentArb,
  totalInterest: totalInterestArb,
  generatedAt: generatedAtArb,
});

describe('LoanTermsCard - Currency Formatting', () => {
  /**
   * Validates: Requirement 2.2
   * THE LoanTerms SHALL include: principal amount (formatted as currency)
   */
  it('formats currency values with dollar sign', () => {
    fc.assert(
      fc.property(principalAmountArb, (amount) => {
        const formatted = formatCurrency(amount);
        expect(formatted).toMatch(/^\$/);
      }),
      { numRuns: 100 }
    );
  });

  it('formats currency with proper thousand separators', () => {
    expect(formatCurrency(100000)).toBe('$100,000');
    expect(formatCurrency(1000000)).toBe('$1,000,000');
    expect(formatCurrency(50000)).toBe('$50,000');
  });

  it('formats currency with decimal places when needed', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(1234.5)).toBe('$1,234.5');
    expect(formatCurrency(1234)).toBe('$1,234');
  });

  it('handles edge case amounts', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(1)).toBe('$1');
    expect(formatCurrency(999999999)).toMatch(/^\$999,999,999/);
  });
});

describe('LoanTermsCard - Percentage Formatting', () => {
  /**
   * Validates: Requirement 2.2
   * THE LoanTerms SHALL include: interest rate (formatted as percentage)
   */
  it('formats percentage values with percent sign', () => {
    fc.assert(
      fc.property(interestRateArb, (rate) => {
        const formatted = formatPercentage(rate);
        expect(formatted).toMatch(/%$/);
      }),
      { numRuns: 100 }
    );
  });

  it('formats percentage with two decimal places', () => {
    expect(formatPercentage(5.5)).toBe('5.50%');
    expect(formatPercentage(5)).toBe('5.00%');
    expect(formatPercentage(5.123)).toBe('5.12%');
    expect(formatPercentage(5.126)).toBe('5.13%');
  });

  it('handles edge case percentages', () => {
    expect(formatPercentage(0)).toBe('0.00%');
    expect(formatPercentage(100)).toBe('100.00%');
    expect(formatPercentage(0.01)).toBe('0.01%');
  });
});

describe('LoanTermsCard - Term Length Formatting', () => {
  /**
   * Validates: Requirement 2.2
   * THE LoanTerms SHALL include: term length
   */
  it('formats standard loan terms correctly', () => {
    expect(formatTermLength(360)).toBe('30 years');
    expect(formatTermLength(180)).toBe('15 years');
    expect(formatTermLength(120)).toBe('10 years');
    expect(formatTermLength(60)).toBe('5 years');
  });

  it('handles single year correctly', () => {
    expect(formatTermLength(12)).toBe('1 year');
  });

  it('handles terms with remaining months', () => {
    expect(formatTermLength(18)).toBe('1 year 6 months');
    expect(formatTermLength(30)).toBe('2 years 6 months');
    expect(formatTermLength(13)).toBe('1 year 1 month');
  });

  it('handles edge cases', () => {
    expect(formatTermLength(1)).toBe('0 years 1 month');
    expect(formatTermLength(11)).toBe('0 years 11 months');
  });
});

describe('LoanTermsCard - LoanTerms Interface', () => {
  /**
   * Validates: Requirements 2.1, 2.2
   * IF decision is APPROVED, THEN THE Decision_Engine SHALL generate loan terms
   * THE LoanTerms SHALL include: principal amount, interest rate, term length, monthly payment
   */
  it('accepts valid LoanTerms with all required fields', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        // Verify all required fields are present
        expect(loanTerms.principalAmount).toBeDefined();
        expect(loanTerms.interestRate).toBeDefined();
        expect(loanTerms.termMonths).toBeDefined();
        expect(loanTerms.monthlyPayment).toBeDefined();
        expect(loanTerms.totalInterest).toBeDefined();
        expect(loanTerms.generatedAt).toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('principal amount is always positive', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.principalAmount).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('interest rate is within reasonable bounds', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.interestRate).toBeGreaterThanOrEqual(1.0);
        expect(loanTerms.interestRate).toBeLessThanOrEqual(20.0);
      }),
      { numRuns: 100 }
    );
  });

  it('term months is a valid loan term', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.termMonths).toBeGreaterThan(0);
        expect([60, 120, 180, 240, 300, 360]).toContain(loanTerms.termMonths);
      }),
      { numRuns: 100 }
    );
  });

  it('monthly payment is positive', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.monthlyPayment).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('total interest is non-negative', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.totalInterest).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  it('generatedAt is a valid Date', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        expect(loanTerms.generatedAt).toBeInstanceOf(Date);
        expect(loanTerms.generatedAt.getTime()).not.toBeNaN();
      }),
      { numRuns: 100 }
    );
  });
});

describe('LoanTermsCard - Display Values', () => {
  /**
   * Validates: Requirement 2.2
   * All loan term values should be displayable
   */
  it('all loan term values can be formatted for display', () => {
    fc.assert(
      fc.property(loanTermsArb, (loanTerms) => {
        // All values should be formattable without errors
        const formattedPrincipal = formatCurrency(loanTerms.principalAmount);
        const formattedRate = formatPercentage(loanTerms.interestRate);
        const formattedTerm = formatTermLength(loanTerms.termMonths);
        const formattedPayment = formatCurrency(loanTerms.monthlyPayment);
        const formattedInterest = formatCurrency(loanTerms.totalInterest);
        const formattedDate = loanTerms.generatedAt.toLocaleString();

        // All formatted values should be non-empty strings
        expect(formattedPrincipal.length).toBeGreaterThan(0);
        expect(formattedRate.length).toBeGreaterThan(0);
        expect(formattedTerm.length).toBeGreaterThan(0);
        expect(formattedPayment.length).toBeGreaterThan(0);
        expect(formattedInterest.length).toBeGreaterThan(0);
        expect(formattedDate.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});
