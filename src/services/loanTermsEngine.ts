import type { LoanTerms, LoanDecision } from '../types';

/**
 * Calculate income multiplier based on composite score
 * Higher scores get better multipliers (2.0-3.0x)
 * Requirements: 2.3
 */
export function calculateIncomeMultiplier(compositeScore: number): number {
  if (compositeScore > 800) {
    return 3.0;
  } else if (compositeScore > 700) {
    return 2.5;
  } else {
    return 2.0;
  }
}

/**
 * Calculate interest rate based on risk (composite score)
 * Base rate 5.0% + risk premium based on score distance from max
 * Requirements: 2.4
 */
export function calculateInterestRate(compositeScore: number): number {
  const baseRate = 5.0;
  // Risk premium: (850 - score) / 100, using 850 as reference max for rate calc
  const riskPremium = (850 - Math.min(compositeScore, 850)) / 100;
  return Math.round((baseRate + riskPremium) * 100) / 100;
}

/**
 * Calculate monthly payment using standard amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Requirements: 2.5
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  return Math.round((principal * (numerator / denominator)) * 100) / 100;
}

/**
 * Generate loan terms for approved applications
 * Requirements: 2.1-2.5
 */
export function calculateLoanTerms(
  compositeScore: number,
  annualIncome: number,
  decision: LoanDecision
): LoanTerms | null {
  // Only generate terms for approved loans (Requirement 2.1)
  if (decision !== 'APPROVED') {
    return null;
  }
  
  // Calculate principal based on income multiplier (Requirement 2.3)
  const multiplier = calculateIncomeMultiplier(compositeScore);
  const principalAmount = Math.round(annualIncome * multiplier);
  
  // Calculate interest rate based on risk (Requirement 2.4)
  const interestRate = calculateInterestRate(compositeScore);
  
  // Standard 30-year term
  const termMonths = 360;
  
  // Calculate monthly payment using amortization formula (Requirement 2.5)
  const monthlyPayment = calculateMonthlyPayment(principalAmount, interestRate, termMonths);
  
  // Calculate total interest over loan term
  const totalInterest = Math.round((monthlyPayment * termMonths - principalAmount) * 100) / 100;
  
  return {
    principalAmount,
    interestRate,
    termMonths,
    monthlyPayment,
    totalInterest,
    generatedAt: new Date(),
  };
}
