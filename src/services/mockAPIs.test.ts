import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getCreditScoreSync } from './mockCreditBureau';
import { getESGScoreSync, getSupportedIndustries } from './mockESGProvider';

/**
 * Property 3: Mock API Response Validity
 * Validates: Requirements 5.1, 5.2, 5.4, 5.5
 * 
 * For any SSN, credit score SHALL be in [300, 850] and deterministic.
 * For any company/industry, ESG score SHALL be in [0, 100].
 */
describe('Property 3: Mock API Response Validity', () => {
  // Arbitrary for SSN-like strings (9 digits, optionally with dashes)
  const digitChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
  const ssnArbitrary = fc.oneof(
    // Plain 9 digits
    fc.array(digitChar, { minLength: 9, maxLength: 9 }).map(arr => arr.join('')),
    // With dashes (XXX-XX-XXXX format)
    fc.tuple(
      fc.array(digitChar, { minLength: 3, maxLength: 3 }).map(arr => arr.join('')),
      fc.array(digitChar, { minLength: 2, maxLength: 2 }).map(arr => arr.join('')),
      fc.array(digitChar, { minLength: 4, maxLength: 4 }).map(arr => arr.join(''))
    ).map(([a, b, c]) => `${a}-${b}-${c}`)
  );

  // Arbitrary for company names
  const companyArbitrary = fc.string({ minLength: 1, maxLength: 50 });

  // Arbitrary for industry (use supported industries)
  const industryArbitrary = fc.constantFrom(...getSupportedIndustries(), 'unknown', 'other');

  /**
   * Property 3a: Credit scores are in valid range [300, 850]
   * Validates: Requirement 5.1
   */
  it('credit scores are always in range [300, 850]', () => {
    fc.assert(
      fc.property(ssnArbitrary, (ssn) => {
        const score = getCreditScoreSync(ssn);
        expect(score).toBeGreaterThanOrEqual(300);
        expect(score).toBeLessThanOrEqual(850);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: Credit scores are deterministic for same SSN
   * Validates: Requirement 5.4
   */
  it('credit scores are deterministic for the same SSN', () => {
    fc.assert(
      fc.property(ssnArbitrary, (ssn) => {
        const score1 = getCreditScoreSync(ssn);
        const score2 = getCreditScoreSync(ssn);
        expect(score1).toBe(score2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3c: ESG scores are in valid range [0, 100]
   * Validates: Requirement 5.2
   */
  it('ESG scores are always in range [0, 100]', () => {
    fc.assert(
      fc.property(companyArbitrary, industryArbitrary, (company, industry) => {
        const score = getESGScoreSync(company, industry);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3d: ESG scores are deterministic for same company/industry
   * Validates: Requirement 5.5 (industry-specific implies deterministic)
   */
  it('ESG scores are deterministic for the same company and industry', () => {
    fc.assert(
      fc.property(companyArbitrary, industryArbitrary, (company, industry) => {
        const score1 = getESGScoreSync(company, industry);
        const score2 = getESGScoreSync(company, industry);
        expect(score1).toBe(score2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3e: Different industries produce different ESG profiles
   * Validates: Requirement 5.5 (industry-specific scores)
   */
  it('different industries can produce different ESG scores for same company', () => {
    // This is a softer property - we just verify the system CAN produce different scores
    // for different industries (not that it always does)
    const industries = getSupportedIndustries();
    const testCompany = 'TestCompany';
    
    const scores = industries.map(industry => getESGScoreSync(testCompany, industry));
    const uniqueScores = new Set(scores);
    
    // At least some industries should produce different scores
    expect(uniqueScores.size).toBeGreaterThan(1);
  });
});
