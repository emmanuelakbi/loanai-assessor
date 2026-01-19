import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateMetrics } from './metricsEngine';
import type { Assessment, LoanDecision, IndustrySector } from '../types';

/**
 * Property-based tests for Dashboard Metrics Accuracy
 * 
 * **Property 8: Dashboard Metrics Accuracy**
 * **Validates: Requirements 1.4, 6.4**
 * 
 * For any set of assessments:
 * - todayAssessments MUST equal count of assessments where createdAt is today
 * - approvalRate MUST equal (approved count / total count) × 100
 * - averageTimeSeconds MUST equal sum(processingTimeMs) / count / 1000
 */

// Industry sectors for generating valid assessments
const INDUSTRY_SECTORS: IndustrySector[] = [
  'Technology', 'Healthcare', 'Manufacturing', 'Finance',
  'Energy', 'Retail', 'Agriculture', 'Construction'
];

// Arbitrary for loan decisions
const decisionArb = fc.constantFrom<LoanDecision>('APPROVED', 'REVIEW', 'REJECTED');

// Arbitrary for industry sectors
const industryArb = fc.constantFrom<IndustrySector>(...INDUSTRY_SECTORS);

// Arbitrary for processing time in milliseconds (realistic range: 100ms to 60s)
const processingTimeArb = fc.integer({ min: 100, max: 60000 });

// Arbitrary for dates - either today or in the past
const dateArb = (isToday: boolean): fc.Arbitrary<Date> => {
  if (isToday) {
    // Generate a date that is today (same calendar day)
    const today = new Date();
    return fc.integer({ min: 0, max: 23 }).chain(hour =>
      fc.integer({ min: 0, max: 59 }).chain(minute =>
        fc.integer({ min: 0, max: 59 }).map(second => {
          const date = new Date(today);
          date.setHours(hour, minute, second, 0);
          return date;
        })
      )
    );
  } else {
    // Generate a date in the past (1-365 days ago)
    return fc.integer({ min: 1, max: 365 }).map(daysAgo => {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date;
    });
  }
};

// Arbitrary for a complete Assessment object
const assessmentArb = (isToday: boolean): fc.Arbitrary<Assessment> => {
  return fc.record({
    id: fc.uuid(),
    borrower: fc.record({
      id: fc.uuid(),
      fullName: fc.string({ minLength: 1, maxLength: 50 }),
      ssn: fc.constant('XXX-XX-1234'),
      annualIncome: fc.integer({ min: 20000, max: 500000 }),
      totalAssets: fc.integer({ min: 10000, max: 2000000 }),
      companyName: fc.string({ minLength: 1, maxLength: 50 }),
      industrySector: industryArb,
      createdAt: dateArb(isToday),
    }),
    creditScore: fc.record({
      score: fc.integer({ min: 300, max: 850 }),
      maxScore: fc.constant(850 as const),
      history: fc.record({
        accountAge: fc.integer({ min: 0, max: 50 }),
        onTimePayments: fc.integer({ min: 0, max: 100 }),
        creditUtilization: fc.integer({ min: 0, max: 100 }),
        derogatoriesCount: fc.integer({ min: 0, max: 10 }),
      }),
      source: fc.constant('MockCreditBureau' as const),
      fetchedAt: fc.date(),
    }),
    esgScore: fc.record({
      total: fc.integer({ min: 0, max: 100 }),
      environmental: fc.integer({ min: 0, max: 100 }),
      social: fc.integer({ min: 0, max: 100 }),
      governance: fc.integer({ min: 0, max: 100 }),
      industryBenchmark: fc.integer({ min: 0, max: 100 }),
      source: fc.constant('MockESGProvider' as const),
      fetchedAt: fc.date(),
    }),
    incomeAssetsScore: fc.record({
      debtToIncomeRatio: fc.float({ min: 0, max: 100 }),
      assetCoverageRatio: fc.float({ min: 0, max: 10 }),
      score: fc.integer({ min: 0, max: 100 }),
    }),
    compositeScore: fc.record({
      total: fc.integer({ min: 0, max: 1000 }),
      creditComponent: fc.integer({ min: 0, max: 400 }),
      incomeComponent: fc.integer({ min: 0, max: 300 }),
      esgComponent: fc.integer({ min: 0, max: 300 }),
      decision: decisionArb,
      processingTimeMs: processingTimeArb,
    }),
    loanTerms: fc.constant(undefined),
    auditTrail: fc.constant([]),
    status: fc.constant('complete' as const),
    createdAt: dateArb(isToday),
    completedAt: fc.option(fc.date(), { nil: undefined }),
  });
};

// Generate a mixed list of assessments (some today, some not)
const mixedAssessmentsArb = fc.tuple(
  fc.array(assessmentArb(true), { minLength: 0, maxLength: 20 }),  // Today's assessments
  fc.array(assessmentArb(false), { minLength: 0, maxLength: 20 }) // Past assessments
).map(([todayAssessments, pastAssessments]) => ({
  all: [...todayAssessments, ...pastAssessments],
  todayOnly: todayAssessments,
}));

describe('Property 8: Dashboard Metrics Accuracy', () => {
  /**
   * **Property 8.1: todayAssessments count accuracy**
   * **Validates: Requirements 1.4, 6.4**
   * 
   * todayAssessments MUST equal count of assessments where createdAt is today
   */
  it('todayAssessments equals count of assessments where createdAt is today', () => {
    fc.assert(
      fc.property(mixedAssessmentsArb, ({ all, todayOnly }) => {
        const metrics = calculateMetrics(all);
        
        // The todayAssessments count should match the number of assessments created today
        expect(metrics.todayAssessments).toBe(todayOnly.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 8.2: approvalRate calculation accuracy**
   * **Validates: Requirements 1.4, 6.4**
   * 
   * approvalRate MUST equal (approved count / total count) × 100
   */
  it('approvalRate equals (approved / total) × 100 for today\'s assessments', () => {
    fc.assert(
      fc.property(mixedAssessmentsArb, ({ all, todayOnly }) => {
        const metrics = calculateMetrics(all);
        
        if (todayOnly.length === 0) {
          // When no assessments today, approval rate should be 0
          expect(metrics.approvalRate).toBe(0);
        } else {
          // Calculate expected approval rate
          const approvedCount = todayOnly.filter(
            a => a.compositeScore.decision === 'APPROVED'
          ).length;
          const expectedRate = (approvedCount / todayOnly.length) * 100;
          
          expect(metrics.approvalRate).toBeCloseTo(expectedRate, 10);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 8.3: averageTimeSeconds calculation accuracy**
   * **Validates: Requirements 1.4, 6.4**
   * 
   * averageTimeSeconds MUST equal sum(processingTimeMs) / count / 1000
   */
  it('averageTimeSeconds equals sum(processingTimeMs) / count / 1000', () => {
    fc.assert(
      fc.property(mixedAssessmentsArb, ({ all, todayOnly }) => {
        const metrics = calculateMetrics(all);
        
        if (todayOnly.length === 0) {
          // When no assessments today, average time should be 0
          expect(metrics.averageTimeSeconds).toBe(0);
        } else {
          // Calculate expected average time
          const totalTimeMs = todayOnly.reduce(
            (sum, a) => sum + a.compositeScore.processingTimeMs,
            0
          );
          const expectedAvgSeconds = totalTimeMs / todayOnly.length / 1000;
          
          expect(metrics.averageTimeSeconds).toBeCloseTo(expectedAvgSeconds, 10);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Property 8: Combined metrics accuracy test**
   * **Validates: Requirements 1.4, 6.4**
   * 
   * All dashboard metrics are calculated correctly for any set of assessments
   */
  it('all metrics are calculated correctly for any set of assessments', () => {
    fc.assert(
      fc.property(mixedAssessmentsArb, ({ all, todayOnly }) => {
        const metrics = calculateMetrics(all);
        const today = new Date().toDateString();
        
        // Verify todayAssessments (Requirement 1.4)
        const actualTodayCount = all.filter(
          a => a.createdAt.toDateString() === today
        ).length;
        expect(metrics.todayAssessments).toBe(actualTodayCount);
        
        // Verify approvalRate (Requirement 1.4)
        if (todayOnly.length === 0) {
          expect(metrics.approvalRate).toBe(0);
        } else {
          const approvedCount = todayOnly.filter(
            a => a.compositeScore.decision === 'APPROVED'
          ).length;
          const expectedRate = (approvedCount / todayOnly.length) * 100;
          expect(metrics.approvalRate).toBeCloseTo(expectedRate, 10);
        }
        
        // Verify averageTimeSeconds (Requirement 1.4)
        if (todayOnly.length === 0) {
          expect(metrics.averageTimeSeconds).toBe(0);
        } else {
          const totalTimeMs = todayOnly.reduce(
            (sum, a) => sum + a.compositeScore.processingTimeMs,
            0
          );
          const expectedAvgSeconds = totalTimeMs / todayOnly.length / 1000;
          expect(metrics.averageTimeSeconds).toBeCloseTo(expectedAvgSeconds, 10);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Property 8 Edge Cases: Dashboard Metrics Calculation', () => {
  /**
   * **Validates: Requirements 1.4, 6.4**
   * Empty assessments array should return zero metrics
   */
  it('returns zero metrics for empty assessments array', () => {
    const metrics = calculateMetrics([]);
    
    expect(metrics.todayAssessments).toBe(0);
    expect(metrics.approvalRate).toBe(0);
    expect(metrics.averageTimeSeconds).toBe(0);
    expect(metrics.timeSavedPercent).toBe(100); // 100% time saved when no processing
  });

  /**
   * **Validates: Requirements 1.4, 6.4**
   * Only past assessments should result in zero today metrics
   */
  it('returns zero today metrics when all assessments are from past days', () => {
    fc.assert(
      fc.property(
        fc.array(assessmentArb(false), { minLength: 1, maxLength: 10 }),
        (pastAssessments) => {
          const metrics = calculateMetrics(pastAssessments);
          
          expect(metrics.todayAssessments).toBe(0);
          expect(metrics.approvalRate).toBe(0);
          expect(metrics.averageTimeSeconds).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Validates: Requirements 1.4, 6.4**
   * All approved assessments should result in 100% approval rate
   */
  it('returns 100% approval rate when all today assessments are approved', () => {
    // Create arbitrary for approved-only assessments
    const approvedAssessmentArb = assessmentArb(true).map(assessment => ({
      ...assessment,
      compositeScore: {
        ...assessment.compositeScore,
        decision: 'APPROVED' as LoanDecision,
      },
    }));

    fc.assert(
      fc.property(
        fc.array(approvedAssessmentArb, { minLength: 1, maxLength: 10 }),
        (approvedAssessments) => {
          const metrics = calculateMetrics(approvedAssessments);
          
          expect(metrics.approvalRate).toBe(100);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * **Validates: Requirements 1.4, 6.4**
   * No approved assessments should result in 0% approval rate
   */
  it('returns 0% approval rate when no today assessments are approved', () => {
    // Create arbitrary for non-approved assessments
    const nonApprovedDecisionArb = fc.constantFrom<LoanDecision>('REVIEW', 'REJECTED');
    const nonApprovedAssessmentArb = assessmentArb(true).chain(assessment =>
      nonApprovedDecisionArb.map(decision => ({
        ...assessment,
        compositeScore: {
          ...assessment.compositeScore,
          decision,
        },
      }))
    );

    fc.assert(
      fc.property(
        fc.array(nonApprovedAssessmentArb, { minLength: 1, maxLength: 10 }),
        (nonApprovedAssessments) => {
          const metrics = calculateMetrics(nonApprovedAssessments);
          
          expect(metrics.approvalRate).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});
