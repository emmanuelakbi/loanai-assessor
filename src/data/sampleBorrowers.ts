/**
 * Sample demo borrowers for showcasing the LoanAI Assessor system.
 * These borrowers are designed to produce specific composite scores
 * matching the demo requirements:
 * 
 * 1. John Smith - Tech - Score 782 - APPROVED
 * 2. Jane Doe - Healthcare - Score 645 - REVIEW
 * 3. Bob Wilson - Manufacturing - Score 521 - REJECTED
 * 4. Alice Brown - Finance - Score 812 - APPROVED
 * 5. Carol Davis - Energy - Score 698 - REVIEW
 * 
 * Requirements: 4.1, 4.2, 4.3
 */

import type { Borrower, IndustrySector, LoanDecision } from '../types';

export interface SampleBorrower extends Omit<Borrower, 'id' | 'createdAt'> {
  description: string;
  expectedDecision: LoanDecision;
  expectedScore: number;
}

/**
 * Five demo borrowers representing different assessment scenarios.
 * Each borrower is crafted to produce a specific composite score
 * that demonstrates the three decision types: APPROVED, REVIEW, REJECTED.
 * 
 * Score breakdown (max 1000):
 * - Credit component: 40% weight (0-400 points)
 * - Income/Assets component: 30% weight (0-300 points)
 * - ESG component: 30% weight (0-300 points)
 * 
 * Decision thresholds:
 * - APPROVED: score > 750
 * - REVIEW: score 600-750
 * - REJECTED: score < 600
 */
export const sampleBorrowers: SampleBorrower[] = [
  {
    // John Smith - Tech Executive - APPROVED (782)
    // High credit score, excellent income/assets, strong tech ESG
    fullName: 'John Smith',
    ssn: '111-22-3333',
    annualIncome: 200000,
    totalAssets: 1200000,
    companyName: 'TechVenture Solutions',
    industrySector: 'Technology' as IndustrySector,
    description: 'Tech executive with excellent credit, high income/assets ratio, and strong ESG sector',
    expectedDecision: 'APPROVED',
    expectedScore: 782,
  },
  {
    // Jane Doe - Healthcare Professional - REVIEW (645)
    // Moderate credit, good income/assets, healthcare ESG
    fullName: 'Jane Doe',
    ssn: '222-33-4444',
    annualIncome: 95000,
    totalAssets: 320000,
    companyName: 'HealthFirst Medical Group',
    industrySector: 'Healthcare' as IndustrySector,
    description: 'Healthcare professional with moderate credit and solid financials, requires review',
    expectedDecision: 'REVIEW',
    expectedScore: 645,
  },
  {
    // Bob Wilson - Manufacturing Worker - REJECTED (521)
    // Lower credit, limited assets, manufacturing ESG penalties
    fullName: 'Bob Wilson',
    ssn: '333-44-5555',
    annualIncome: 55000,
    totalAssets: 45000,
    companyName: 'Industrial Works LLC',
    industrySector: 'Manufacturing' as IndustrySector,
    description: 'Manufacturing worker with lower credit score and limited assets',
    expectedDecision: 'REJECTED',
    expectedScore: 521,
  },
  {
    // Alice Brown - Finance Executive - APPROVED (812)
    // Excellent credit, strong assets, finance sector governance
    fullName: 'Alice Brown',
    ssn: '444-55-6666',
    annualIncome: 250000,
    totalAssets: 1800000,
    companyName: 'Capital Finance Partners',
    industrySector: 'Finance' as IndustrySector,
    description: 'Finance executive with excellent credit history and substantial assets',
    expectedDecision: 'APPROVED',
    expectedScore: 812,
  },
  {
    // Carol Davis - Energy Sector - REVIEW (698)
    // Good credit, moderate assets, energy ESG challenges
    fullName: 'Carol Davis',
    ssn: '555-66-7777',
    annualIncome: 120000,
    totalAssets: 450000,
    companyName: 'GreenEnergy Solutions',
    industrySector: 'Energy' as IndustrySector,
    description: 'Energy sector professional with good credit but ESG challenges from industry',
    expectedDecision: 'REVIEW',
    expectedScore: 698,
  },
];

/**
 * Get a sample borrower by index (0-4)
 */
export function getSampleBorrower(index: number): SampleBorrower | undefined {
  return sampleBorrowers[index];
}

/**
 * Get a sample borrower by name
 */
export function getSampleBorrowerByName(name: string): SampleBorrower | undefined {
  return sampleBorrowers.find(
    (b) => b.fullName.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all sample borrowers for a specific expected decision
 */
export function getSampleBorrowersByDecision(
  decision: LoanDecision
): SampleBorrower[] {
  return sampleBorrowers.filter((b) => b.expectedDecision === decision);
}

/**
 * Convert a sample borrower to a full Borrower object
 */
export function createBorrowerFromSample(sample: SampleBorrower): Borrower {
  return {
    id: crypto.randomUUID(),
    fullName: sample.fullName,
    ssn: sample.ssn,
    annualIncome: sample.annualIncome,
    totalAssets: sample.totalAssets,
    companyName: sample.companyName,
    industrySector: sample.industrySector,
    createdAt: new Date(),
  };
}

/**
 * Get summary of sample borrowers for demo purposes
 */
export function getSampleBorrowersSummary(): Array<{
  name: string;
  industry: IndustrySector;
  expectedScore: number;
  expectedDecision: LoanDecision;
}> {
  return sampleBorrowers.map((b) => ({
    name: b.fullName,
    industry: b.industrySector,
    expectedScore: b.expectedScore,
    expectedDecision: b.expectedDecision,
  }));
}

export default sampleBorrowers;
