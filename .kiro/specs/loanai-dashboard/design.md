# Design Document: Dashboard Module

## Overview

The Dashboard is the landing page showing key metrics, recent activity, and ROI calculations.

## Architecture

```
DashboardScreen
├── MetricsCards
│   ├── MetricCard (Today's Assessments)
│   ├── MetricCard (Approval Rate)
│   ├── MetricCard (Avg Time)
│   └── MetricCard (Time Saved)
├── RecentAssessments
└── ROICalculator
```

## Components and Interfaces

```typescript
interface DashboardMetrics {
  todayAssessments: number;
  approvalRate: number;
  averageTimeSeconds: number;
  timeSavedPercent: number;
}

function calculateMetrics(assessments: Assessment[]): DashboardMetrics {
  const today = new Date().toDateString();
  const todayAssessments = assessments.filter(a => a.createdAt.toDateString() === today);
  const approved = todayAssessments.filter(a => a.compositeScore.decision === 'APPROVED').length;
  const totalTime = todayAssessments.reduce((sum, a) => sum + a.compositeScore.processingTimeMs, 0);
  const avgTimeMs = todayAssessments.length > 0 ? totalTime / todayAssessments.length : 0;
  const manualTimeMs = 5 * 60 * 1000;
  const timeSaved = ((manualTimeMs - avgTimeMs) / manualTimeMs) * 100;
  
  return {
    todayAssessments: todayAssessments.length,
    approvalRate: todayAssessments.length > 0 ? (approved / todayAssessments.length) * 100 : 0,
    averageTimeSeconds: avgTimeMs / 1000,
    timeSavedPercent: Math.max(0, timeSaved)
  };
}
```

## Correctness Properties

### Property 1: Dashboard Metrics Accuracy
*For any* set of assessments:
- todayAssessments === count where createdAt is today
- approvalRate === (approved / total) × 100
- averageTimeSeconds === sum(processingTimeMs) / count / 1000
**Validates: Requirements 5.1, 5.2, 5.3**

## Testing Strategy
- Property tests for metrics calculation accuracy
