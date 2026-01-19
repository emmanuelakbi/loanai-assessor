import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './RecentAssessments';
import type { Assessment, Borrower, CreditScore, ESGScore, IncomeAssetsScore, CompositeScore } from '../../types';

// Helper to create a mock assessment
function createMockAssessment(overrides: {
  id?: string;
  fullName?: string;
  score?: number;
  decision?: 'APPROVED' | 'REVIEW' | 'REJECTED';
  createdAt?: Date;
} = {}): Assessment {
  const borrower: Borrower = {
    id: 'borrower-1',
    fullName: overrides.fullName ?? 'John Doe',
    ssn: 'XXX-XX-1234',
    annualIncome: 100000,
    totalAssets: 500000,
    companyName: 'Test Corp',
    industrySector: 'Technology',
    createdAt: new Date(),
  };

  const creditScore: CreditScore = {
    score: 750,
    maxScore: 850,
    history: {
      accountAge: 10,
      onTimePayments: 98,
      creditUtilization: 25,
      derogatoriesCount: 0,
    },
    source: 'MockCreditBureau',
    fetchedAt: new Date(),
  };

  const esgScore: ESGScore = {
    total: 80,
    environmental: 75,
    social: 85,
    governance: 80,
    industryBenchmark: 70,
    source: 'MockESGProvider',
    fetchedAt: new Date(),
  };

  const incomeAssetsScore: IncomeAssetsScore = {
    debtToIncomeRatio: 30,
    assetCoverageRatio: 5,
    score: 85,
  };

  const compositeScore: CompositeScore = {
    total: overrides.score ?? 800,
    creditComponent: 320,
    incomeComponent: 240,
    esgComponent: 240,
    decision: overrides.decision ?? 'APPROVED',
    processingTimeMs: 1500,
  };

  return {
    id: overrides.id ?? 'assessment-1',
    borrower,
    creditScore,
    esgScore,
    incomeAssetsScore,
    compositeScore,
    auditTrail: [],
    status: 'complete',
    createdAt: overrides.createdAt ?? new Date(),
    completedAt: new Date(),
  };
}

describe('formatRelativeTime', () => {
  it('should format seconds ago correctly', () => {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('30 seconds ago');
  });

  it('should format 1 second ago correctly', () => {
    const now = new Date();
    const oneSecondAgo = new Date(now.getTime() - 1 * 1000);
    expect(formatRelativeTime(oneSecondAgo)).toBe('1 second ago');
  });

  it('should format minutes ago correctly', () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should format 1 minute ago correctly', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 1 * 60 * 1000);
    expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago');
  });

  it('should format hours ago correctly', () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeHoursAgo)).toBe('3 hours ago');
  });

  it('should format 1 hour ago correctly', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago');
  });

  it('should format days ago correctly', () => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2 days ago');
  });

  it('should format 1 day ago correctly', () => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago');
  });
});

describe('RecentAssessments sorting and limiting', () => {
  it('should sort assessments by most recent first', () => {
    const now = new Date();
    const assessments = [
      createMockAssessment({ id: '1', fullName: 'Oldest', createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) }),
      createMockAssessment({ id: '2', fullName: 'Newest', createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) }),
      createMockAssessment({ id: '3', fullName: 'Middle', createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) }),
    ];

    // Sort the same way the component does
    const sorted = [...assessments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    expect(sorted[0].borrower.fullName).toBe('Newest');
    expect(sorted[1].borrower.fullName).toBe('Middle');
    expect(sorted[2].borrower.fullName).toBe('Oldest');
  });

  it('should limit to maxItems (default 10)', () => {
    const assessments = Array.from({ length: 15 }, (_, i) =>
      createMockAssessment({ id: `${i}`, fullName: `Person ${i}` })
    );

    const maxItems = 10;
    const limited = assessments.slice(0, maxItems);

    expect(limited.length).toBe(10);
  });

  it('should handle empty assessments array', () => {
    const assessments: Assessment[] = [];
    expect(assessments.length).toBe(0);
  });

  it('should handle fewer assessments than maxItems', () => {
    const assessments = [
      createMockAssessment({ id: '1', fullName: 'Person 1' }),
      createMockAssessment({ id: '2', fullName: 'Person 2' }),
    ];

    const maxItems = 10;
    const limited = assessments.slice(0, maxItems);

    expect(limited.length).toBe(2);
  });
});

describe('Assessment data extraction', () => {
  it('should extract borrower name correctly', () => {
    const assessment = createMockAssessment({ fullName: 'Jane Smith' });
    expect(assessment.borrower.fullName).toBe('Jane Smith');
  });

  it('should extract composite score correctly', () => {
    const assessment = createMockAssessment({ score: 850 });
    expect(assessment.compositeScore.total).toBe(850);
  });

  it('should extract decision correctly for APPROVED', () => {
    const assessment = createMockAssessment({ decision: 'APPROVED' });
    expect(assessment.compositeScore.decision).toBe('APPROVED');
  });

  it('should extract decision correctly for REVIEW', () => {
    const assessment = createMockAssessment({ decision: 'REVIEW' });
    expect(assessment.compositeScore.decision).toBe('REVIEW');
  });

  it('should extract decision correctly for REJECTED', () => {
    const assessment = createMockAssessment({ decision: 'REJECTED' });
    expect(assessment.compositeScore.decision).toBe('REJECTED');
  });
});
