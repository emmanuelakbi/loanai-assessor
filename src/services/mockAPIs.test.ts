import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getCreditScoreSync, fetchCreditScore } from './mockCreditBureau';
import { getESGScoreSync, fetchESGScore, getSupportedIndustries } from './mockESGProvider';

/**
 * Property 4: Mock API Response Validity
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
 * 
 * For any mock API call:
 * - Credit Bureau response score MUST be in range [300, 850]
 * - ESG Provider response score MUST be in range [0, 100]
 * - Simulated latency MUST be in range [500ms, 1500ms]
 * - For any SSN value, repeated Credit Bureau calls MUST return identical scores (deterministic)
 */
describe('Property 4: Mock API Response Validity', () => {
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
   * Property 4a: Credit scores are in valid range [300, 850]
   * **Validates: Requirement 7.1**
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
   * Property 4b: Credit scores are deterministic for same SSN
   * **Validates: Requirement 7.4**
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
   * Property 4c: ESG scores are in valid range [0, 100]
   * **Validates: Requirement 7.2**
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
   * Property 4d: ESG scores are deterministic for same company/industry
   * **Validates: Requirement 7.2** (industry-specific implies deterministic)
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
   * Property 4e: Different industries produce different ESG profiles
   * **Validates: Requirement 7.2** (industry-specific scores)
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

  /**
   * Property 4f: Credit Bureau API latency is in valid range [500ms, 1500ms]
   * **Validates: Requirement 7.3**
   */
  it('credit bureau API latency is in range [500ms, 1500ms]', async () => {
    // Test with a few sample SSNs to verify latency range
    const testSSNs = ['123-45-6789', '987-65-4321', '555-55-5555'];
    
    for (const ssn of testSSNs) {
      const response = await fetchCreditScore(ssn);
      expect(response.latencyMs).toBeGreaterThanOrEqual(500);
      expect(response.latencyMs).toBeLessThanOrEqual(1500);
    }
  });

  /**
   * Property 4g: ESG Provider API latency is in valid range [500ms, 1500ms]
   * **Validates: Requirement 7.3**
   */
  it('ESG provider API latency is in range [500ms, 1500ms]', async () => {
    // Test with a few sample company/industry combinations
    const testCases = [
      { company: 'Acme Corp', industry: 'technology' },
      { company: 'Health Inc', industry: 'healthcare' },
      { company: 'Build Co', industry: 'construction' },
    ];
    
    for (const { company, industry } of testCases) {
      const response = await fetchESGScore(company, industry);
      expect(response.latencyMs).toBeGreaterThanOrEqual(500);
      expect(response.latencyMs).toBeLessThanOrEqual(1500);
    }
  });

  /**
   * Property 4h: Credit Bureau async API returns valid scores matching sync version
   * **Validates: Requirements 7.1, 7.4**
   */
  it('credit bureau async API returns scores matching sync version', async () => {
    const testSSN = '123-45-6789';
    const syncScore = getCreditScoreSync(testSSN);
    const asyncResponse = await fetchCreditScore(testSSN);
    
    expect(asyncResponse.success).toBe(true);
    expect(asyncResponse.data.score).toBe(syncScore);
    expect(asyncResponse.data.score).toBeGreaterThanOrEqual(300);
    expect(asyncResponse.data.score).toBeLessThanOrEqual(850);
  });

  /**
   * Property 4i: ESG Provider async API returns valid scores matching sync version
   * **Validates: Requirement 7.2**
   */
  it('ESG provider async API returns scores matching sync version', async () => {
    const testCompany = 'Test Company';
    const testIndustry = 'technology';
    const syncScore = getESGScoreSync(testCompany, testIndustry);
    const asyncResponse = await fetchESGScore(testCompany, testIndustry);
    
    expect(asyncResponse.success).toBe(true);
    expect(asyncResponse.data.overallScore).toBe(syncScore);
    expect(asyncResponse.data.overallScore).toBeGreaterThanOrEqual(0);
    expect(asyncResponse.data.overallScore).toBeLessThanOrEqual(100);
  });
});
