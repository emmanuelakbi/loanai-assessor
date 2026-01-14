# Design Document: Decision Engine Module

## Overview

The Decision Engine displays final loan decisions, generates terms for approved loans, provides PDF export, and maintains audit trails.

## Architecture

```
DecisionScreen
├── DecisionBanner
├── ContentRow
│   ├── LoanTermsCard (if approved)
│   └── PDFPreview
├── AuditTrail
├── ActionButtons
└── ProcessingComparison
```

## Components and Interfaces

```typescript
interface LoanTerms {
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  generatedAt: Date;
}

interface AuditEntry {
  timestamp: Date;
  action: string;
  dataSource: string;
  details?: Record<string, unknown>;
}
```

## Loan Terms Calculation

```typescript
function calculateLoanTerms(score: number, annualIncome: number): LoanTerms {
  const multiplier = score > 800 ? 3.0 : score > 700 ? 2.5 : 2.0;
  const principal = Math.round(annualIncome * multiplier);
  const riskPremium = (850 - score) / 100;
  const interestRate = Math.round((5.0 + riskPremium) * 100) / 100;
  const termMonths = 360;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return { principalAmount: principal, interestRate, termMonths, monthlyPayment, totalInterest: (monthlyPayment * termMonths) - principal, generatedAt: new Date() };
}
```

## Correctness Properties

### Property 1: Loan Terms Generation for Approved Loans
*For any* APPROVED assessment: loanTerms defined, all values positive, payment matches formula.
**Validates: Requirements 2.1-2.5**

### Property 2: Audit Trail Completeness
*For any* assessment: audit trail contains credit, ESG, score, decision entries in order.
**Validates: Requirements 4.1-4.4**

## Testing Strategy
- Property tests for loan terms generation
- Property tests for audit trail completeness
