# Design Document: Batch Processor Module

## Overview

The Batch Processor enables enterprise-scale loan assessment through CSV upload, processing thousands of applications with progress tracking and exportable results.

## Architecture

```
BatchProcessorScreen
├── CSVDropzone
├── BatchProgressBar (during processing)
├── BatchResultsTable (after complete)
├── BatchSummary
├── EfficiencyMetrics
└── ExportButton
```

## Components and Interfaces

```typescript
interface BatchJob {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  results: BatchResult[];
  status: 'uploading' | 'validating' | 'processing' | 'complete' | 'error';
  startedAt: Date;
  completedAt?: Date;
  summary?: BatchSummary;
}

interface BatchResult {
  rowIndex: number;
  borrowerName: string;
  compositeScore: number;
  decision: 'APPROVED' | 'REVIEW' | 'REJECTED';
  processingTimeMs: number;
  error?: string;
}

interface BatchSummary {
  totalProcessed: number;
  approvedCount: number;
  reviewCount: number;
  rejectedCount: number;
  errorCount: number;
  totalTimeMs: number;
}

const REQUIRED_COLUMNS = ['name', 'ssn', 'annual_income', 'total_assets', 'company', 'industry'];
```

## Correctness Properties

### Property 1: Batch Processing Accuracy
*For any* completed batch: results.length === totalRows, summary counts match results, decisions match thresholds.
**Validates: Requirements 3.1, 4.1-4.5**

### Property 2: CSV Validation
*For any* CSV: all required columns → pass, missing columns → fail with error.
**Validates: Requirements 1.3, 1.5**

## Testing Strategy
- Property tests for batch processing accuracy
- Property tests for CSV validation
