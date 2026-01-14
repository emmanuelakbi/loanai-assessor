# Design Document: API Scoring Module

## Overview

The API Scoring Module is the core assessment engine. It fetches data from mock APIs, calculates weighted composite scores, and visualizes results with animated gauges and progress bars.

## Architecture

```
APIScoringScreen
├── ScoreHeader ("Credit Assessment")
├── CompositeScoreCard
│   ├── CompositeScoreGauge (animated arc)
│   └── DecisionIndicator (APPROVED/REVIEW/REJECTED)
├── ScoreBreakdown
│   ├── CreditScoreBar (40% weight)
│   ├── IncomeAssetsBar (30% weight)
│   └── ESGScoreBar (30% weight)
├── ProcessingTime
└── NavigationCountdown

Services:
├── mockCreditBureau.ts
├── mockESGProvider.ts
└── scoringEngine.ts
```

## Components and Interfaces

```typescript
interface CreditScore {
  score: number;        // 300-850
  factors: CreditFactors;
  source: 'MockCreditBureau';
  fetchedAt: Date;
}

interface ESGScore {
  total: number;        // 0-100
  environmental: number;
  social: number;
  governance: number;
  source: 'MockESGProvider';
  fetchedAt: Date;
}

interface CompositeScore {
  total: number;        // 0-1000
  creditComponent: number;    // max 400
  incomeComponent: number;    // max 300
  esgComponent: number;       // max 300
  decision: 'APPROVED' | 'REVIEW' | 'REJECTED';
  processingTimeMs: number;
}
```

## Scoring Algorithm

```typescript
function calculateCompositeScore(credit, income, esg): CompositeScore {
  const creditComponent = Math.round(((credit.score - 300) / 550) * 400);
  const incomeComponent = Math.round((income.score / 100) * 300);
  const esgComponent = Math.round((esg.total / 100) * 300);
  const total = creditComponent + incomeComponent + esgComponent;
  const decision = total > 750 ? 'APPROVED' : total >= 600 ? 'REVIEW' : 'REJECTED';
  return { total, creditComponent, incomeComponent, esgComponent, decision };
}
```

## Correctness Properties

### Property 1: Composite Score Calculation Accuracy
*For any* valid inputs, composite score SHALL be in [0, 1000] with correct weighted components.
**Validates: Requirements 2.1-2.5**

### Property 2: Decision Threshold Consistency
*For any* score: >750=APPROVED, 600-750=REVIEW, <600=REJECTED
**Validates: Requirements 4.1-4.4**

### Property 3: Mock API Response Validity
*For any* SSN, credit score in [300, 850] and deterministic. ESG in [0, 100].
**Validates: Requirements 5.1, 5.2, 5.4, 5.5**

## Testing Strategy
- Property tests for score calculation
- Property tests for decision thresholds
- Property tests for mock API validity
