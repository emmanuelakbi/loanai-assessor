import type { CompositeScore, IncomeAssetsScore, LoanDecision } from '../types';

/**
 * Input for credit score component
 */
export interface CreditInput {
  score: number; // 300-850 range
}

/**
 * Input for income/assets score component
 */
export interface IncomeAssetsInput {
  score: number; // 0-100 normalized score
}

/**
 * Input for ESG score component
 */
export interface ESGInput {
  total: number; // 0-100 range
}

/**
 * Calculate income/assets score from borrower financial data
 * 
 * Calculates:
 * - Debt-to-income ratio (DTI): lower is better
 * - Asset coverage ratio (ACR): higher is better
 * - Combined normalized score (0-100)
 * 
 * Scoring breakdown:
 * - DTI: 0-20% = 50pts, 20-35% = 35pts, 35-50% = 20pts, >50% = 10pts
 * - ACR: >5x = 50pts, 3-5x = 40pts, 1-3x = 25pts, <1x = 10pts
 * 
 * Requirements: 3.5
 */
export function calculateIncomeAssetsScore(
  annualIncome: number,
  totalAssets: number,
  estimatedDebt: number = 0
): IncomeAssetsScore {
  // Ensure non-negative values
  const income = Math.max(0, annualIncome);
  const assets = Math.max(0, totalAssets);
  const debt = Math.max(0, estimatedDebt);

  // Calculate debt-to-income ratio (percentage)
  // If no debt provided, assume 25% as reasonable default
  const dti = income > 0 
    ? (debt > 0 ? (debt / income) * 100 : 25) 
    : 100;

  // Calculate asset coverage ratio (assets / income)
  const acr = income > 0 ? assets / income : 0;

  // DTI scoring: lower DTI = higher score
  let dtiScore: number;
  if (dti <= 20) {
    dtiScore = 50;
  } else if (dti <= 35) {
    dtiScore = 35;
  } else if (dti <= 50) {
    dtiScore = 20;
  } else {
    dtiScore = 10;
  }

  // ACR scoring: higher ACR = higher score
  let acrScore: number;
  if (acr > 5) {
    acrScore = 50;
  } else if (acr > 3) {
    acrScore = 40;
  } else if (acr > 1) {
    acrScore = 25;
  } else {
    acrScore = 10;
  }

  // Combined score (0-100)
  const score = dtiScore + acrScore;

  return {
    debtToIncomeRatio: Math.round(dti),
    assetCoverageRatio: Math.round(acr * 100) / 100,
    score,
  };
}

/**
 * Normalize credit score (300-850) to weighted component (0-400)
 * Requirements: 2.2
 */
export function normalizeCreditScore(creditScore: number): number {
  // Clamp to valid range
  const clamped = Math.max(300, Math.min(850, creditScore));
  // Normalize: (score - 300) / 550 * 400
  return Math.round(((clamped - 300) / 550) * 400);
}

/**
 * Normalize income/assets score (0-100) to weighted component (0-300)
 * Requirements: 2.3
 */
export function normalizeIncomeAssetsScore(incomeScore: number): number {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(100, incomeScore));
  // Normalize: score / 100 * 300
  return Math.round((clamped / 100) * 300);
}

/**
 * Normalize ESG score (0-100) to weighted component (0-300)
 * Requirements: 2.4
 */
export function normalizeESGScore(esgScore: number): number {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(100, esgScore));
  // Normalize: score / 100 * 300
  return Math.round((clamped / 100) * 300);
}

/**
 * Determine loan decision based on composite score
 * Requirements: 4.1-4.4
 */
export function determineDecision(compositeScore: number): LoanDecision {
  if (compositeScore > 750) {
    return 'APPROVED';
  } else if (compositeScore >= 600) {
    return 'REVIEW';
  } else {
    return 'REJECTED';
  }
}

/**
 * Calculate composite score from all input components
 * Weighted formula: Credit (40%), Income/Assets (30%), ESG (30%)
 * Requirements: 2.1-2.5, 4.1-4.4
 */
export function calculateCompositeScore(
  credit: CreditInput,
  incomeAssets: IncomeAssetsInput,
  esg: ESGInput,
  processingTimeMs: number = 0
): CompositeScore {
  const creditComponent = normalizeCreditScore(credit.score);
  const incomeComponent = normalizeIncomeAssetsScore(incomeAssets.score);
  const esgComponent = normalizeESGScore(esg.total);
  
  // Sum all components (max 400 + 300 + 300 = 1000)
  const total = creditComponent + incomeComponent + esgComponent;
  
  // Determine decision based on total score
  const decision = determineDecision(total);
  
  return {
    total,
    creditComponent,
    incomeComponent,
    esgComponent,
    decision,
    processingTimeMs,
  };
}
