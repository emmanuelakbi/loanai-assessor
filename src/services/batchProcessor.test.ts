/**
 * Batch Processor Service Tests
 * 
 * Tests for batch processing of CSV data rows.
 * 
 * Requirements:
 * - 2.4: BatchProgressBar SHALL update in real-time
 * - 4.5: BatchSummary counts SHALL equal total processed
 */

import { describe, it, expect, vi } from 'vitest';
import {
  processRow,
  calculateSummary,
  processBatch,
  processBatchAsync,
  validateSummaryCounts,
  type CSVRowData,
} from './batchProcessor';
import type { BatchResult } from '../types';

// Sample test data
const createTestRow = (overrides: Partial<CSVRowData> = {}): CSVRowData => ({
  name: 'John Doe',
  ssn: '123-45-6789',
  annual_income: '100000',
  total_assets: '500000',
  company: 'Tech Corp',
  industry: 'Technology',
  ...overrides,
});

describe('processRow', () => {
  it('should process a valid row and return BatchResult', () => {
    const row = createTestRow();
    const result = processRow(row, 0);

    expect(result.rowIndex).toBe(0);
    expect(result.borrowerName).toBe('John Doe');
    expect(result.compositeScore).toBeGreaterThanOrEqual(0);
    expect(result.compositeScore).toBeLessThanOrEqual(1000);
    expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(result.decision);
    expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
  });

  it('should handle different row indices', () => {
    const row = createTestRow();
    
    const result0 = processRow(row, 0);
    const result5 = processRow(row, 5);
    const result100 = processRow(row, 100);

    expect(result0.rowIndex).toBe(0);
    expect(result5.rowIndex).toBe(5);
    expect(result100.rowIndex).toBe(100);
  });

  it('should handle invalid numeric values gracefully', () => {
    const row = createTestRow({
      annual_income: 'invalid',
      total_assets: 'not-a-number',
    });
    
    const result = processRow(row, 0);

    // Should not throw, should return a result
    expect(result.rowIndex).toBe(0);
    expect(result.borrowerName).toBe('John Doe');
    expect(result.error).toBeUndefined();
  });

  it('should produce deterministic scores for same SSN', () => {
    const row1 = createTestRow({ ssn: '111-22-3333' });
    const row2 = createTestRow({ ssn: '111-22-3333' });

    const result1 = processRow(row1, 0);
    const result2 = processRow(row2, 1);

    // Same SSN should produce same credit score component
    expect(result1.compositeScore).toBe(result2.compositeScore);
    expect(result1.decision).toBe(result2.decision);
  });

  it('should produce different scores for different SSNs', () => {
    const row1 = createTestRow({ ssn: '111-22-3333' });
    const row2 = createTestRow({ ssn: '999-88-7777' });

    const result1 = processRow(row1, 0);
    const result2 = processRow(row2, 1);

    // Different SSNs should likely produce different scores
    // (not guaranteed but highly probable)
    expect(result1.compositeScore !== result2.compositeScore || 
           result1.decision !== result2.decision).toBe(true);
  });
});

describe('calculateSummary', () => {
  it('should calculate correct counts for mixed results', () => {
    const results: BatchResult[] = [
      { rowIndex: 0, borrowerName: 'A', compositeScore: 800, decision: 'APPROVED', processingTimeMs: 10 },
      { rowIndex: 1, borrowerName: 'B', compositeScore: 650, decision: 'REVIEW', processingTimeMs: 10 },
      { rowIndex: 2, borrowerName: 'C', compositeScore: 500, decision: 'REJECTED', processingTimeMs: 10 },
      { rowIndex: 3, borrowerName: 'D', compositeScore: 0, decision: 'REJECTED', processingTimeMs: 10, error: 'Error' },
    ];

    const summary = calculateSummary(results, 100);

    expect(summary.approvedCount).toBe(1);
    expect(summary.reviewCount).toBe(1);
    expect(summary.rejectedCount).toBe(1);
    expect(summary.errorCount).toBe(1);
    expect(summary.totalProcessed).toBe(4);
    expect(summary.totalTimeMs).toBe(100);
  });

  it('should satisfy Requirement 4.5: counts SHALL equal total processed', () => {
    const results: BatchResult[] = [
      { rowIndex: 0, borrowerName: 'A', compositeScore: 800, decision: 'APPROVED', processingTimeMs: 10 },
      { rowIndex: 1, borrowerName: 'B', compositeScore: 650, decision: 'REVIEW', processingTimeMs: 10 },
      { rowIndex: 2, borrowerName: 'C', compositeScore: 500, decision: 'REJECTED', processingTimeMs: 10 },
    ];

    const summary = calculateSummary(results, 100);

    // Requirement 4.5: counts SHALL equal total processed
    const sumOfCounts = summary.approvedCount + summary.reviewCount + summary.rejectedCount + summary.errorCount;
    expect(sumOfCounts).toBe(summary.totalProcessed);
  });

  it('should handle empty results', () => {
    const summary = calculateSummary([], 0);

    expect(summary.totalProcessed).toBe(0);
    expect(summary.approvedCount).toBe(0);
    expect(summary.reviewCount).toBe(0);
    expect(summary.rejectedCount).toBe(0);
    expect(summary.errorCount).toBe(0);
    expect(summary.averageTimeMs).toBe(0);
  });

  it('should calculate correct average time', () => {
    const results: BatchResult[] = [
      { rowIndex: 0, borrowerName: 'A', compositeScore: 800, decision: 'APPROVED', processingTimeMs: 10 },
      { rowIndex: 1, borrowerName: 'B', compositeScore: 650, decision: 'REVIEW', processingTimeMs: 10 },
    ];

    const summary = calculateSummary(results, 100);

    expect(summary.averageTimeMs).toBe(50); // 100ms / 2 rows
  });
});

describe('processBatch', () => {
  it('should process all rows and return results with summary', () => {
    const rows: CSVRowData[] = [
      createTestRow({ name: 'Alice', ssn: '111-11-1111' }),
      createTestRow({ name: 'Bob', ssn: '222-22-2222' }),
      createTestRow({ name: 'Charlie', ssn: '333-33-3333' }),
    ];

    const { results, summary } = processBatch(rows);

    expect(results).toHaveLength(3);
    expect(results[0].borrowerName).toBe('Alice');
    expect(results[1].borrowerName).toBe('Bob');
    expect(results[2].borrowerName).toBe('Charlie');
    expect(summary.totalProcessed).toBe(3);
  });

  it('should call progress callback for real-time updates (Requirement 2.4)', () => {
    const rows: CSVRowData[] = [
      createTestRow({ name: 'A' }),
      createTestRow({ name: 'B' }),
      createTestRow({ name: 'C' }),
    ];

    const progressCallback = vi.fn();
    processBatch(rows, progressCallback);

    // Should be called once per row
    expect(progressCallback).toHaveBeenCalledTimes(3);
    expect(progressCallback).toHaveBeenNthCalledWith(1, 1, 3);
    expect(progressCallback).toHaveBeenNthCalledWith(2, 2, 3);
    expect(progressCallback).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it('should satisfy Requirement 4.5: summary counts equal total processed', () => {
    const rows: CSVRowData[] = Array.from({ length: 10 }, (_, i) => 
      createTestRow({ name: `Person ${i}`, ssn: `${i}00-00-0000` })
    );

    const { results, summary } = processBatch(rows);

    expect(results).toHaveLength(10);
    expect(validateSummaryCounts(summary)).toBe(true);
    
    const sumOfCounts = summary.approvedCount + summary.reviewCount + summary.rejectedCount + summary.errorCount;
    expect(sumOfCounts).toBe(summary.totalProcessed);
    expect(summary.totalProcessed).toBe(10);
  });
});

describe('processBatchAsync', () => {
  it('should process all rows asynchronously', async () => {
    const rows: CSVRowData[] = [
      createTestRow({ name: 'Alice' }),
      createTestRow({ name: 'Bob' }),
    ];

    const { results, summary } = await processBatchAsync(rows);

    expect(results).toHaveLength(2);
    expect(summary.totalProcessed).toBe(2);
  });

  it('should call progress callback for real-time updates (Requirement 2.4)', async () => {
    const rows: CSVRowData[] = [
      createTestRow({ name: 'A' }),
      createTestRow({ name: 'B' }),
      createTestRow({ name: 'C' }),
    ];

    const progressCallback = vi.fn();
    await processBatchAsync(rows, progressCallback, 1);

    expect(progressCallback).toHaveBeenCalledTimes(3);
    expect(progressCallback).toHaveBeenNthCalledWith(1, 1, 3);
    expect(progressCallback).toHaveBeenNthCalledWith(2, 2, 3);
    expect(progressCallback).toHaveBeenNthCalledWith(3, 3, 3);
  });

  it('should process in chunks for UI responsiveness', async () => {
    const rows: CSVRowData[] = Array.from({ length: 25 }, (_, i) => 
      createTestRow({ name: `Person ${i}` })
    );

    const progressCallback = vi.fn();
    await processBatchAsync(rows, progressCallback, 10);

    // Should still call progress for each row
    expect(progressCallback).toHaveBeenCalledTimes(25);
  });
});

describe('validateSummaryCounts', () => {
  it('should return true for valid summary', () => {
    const summary = {
      totalProcessed: 10,
      approvedCount: 3,
      reviewCount: 4,
      rejectedCount: 2,
      errorCount: 1,
      totalTimeMs: 100,
      averageTimeMs: 10,
    };

    expect(validateSummaryCounts(summary)).toBe(true);
  });

  it('should return false for invalid summary', () => {
    const summary = {
      totalProcessed: 10,
      approvedCount: 3,
      reviewCount: 4,
      rejectedCount: 2,
      errorCount: 0, // Should be 1 to equal 10
      totalTimeMs: 100,
      averageTimeMs: 10,
    };

    expect(validateSummaryCounts(summary)).toBe(false);
  });
});


/**
 * Property 5: Batch Processing Accuracy
 * **Validates: Requirements 5.5, 5.6**
 * 
 * For any completed batch job:
 * - results.length MUST equal totalRows
 * - summary.totalProcessed MUST equal results.length
 * - summary.approvedCount + summary.reviewCount + summary.rejectedCount + summary.errorCount MUST equal summary.totalProcessed
 * - Each result.decision MUST match the decision derived from result.compositeScore using Property 2 thresholds
 * 
 * Property 2 thresholds:
 * - Score > 750 → decision MUST be 'APPROVED'
 * - Score >= 600 AND Score <= 750 → decision MUST be 'REVIEW'
 * - Score < 600 → decision MUST be 'REJECTED'
 * 
 * Requirements:
 * - 5.5: WHEN processing completes, THE Batch_Processor SHALL display results table with columns: Borrower, Score, Decision, Processing Time
 * - 5.6: THE Batch_Processor SHALL display summary metrics: Total Processed, Approved Count, Review Count, Rejected Count, Total Time
 */
import * as fc from 'fast-check';

describe('Property 5: Batch Processing Accuracy', () => {
  /**
   * Arbitrary for generating valid SSN strings
   */
  const ssnArb = fc.tuple(
    fc.integer({ min: 100, max: 999 }),
    fc.integer({ min: 10, max: 99 }),
    fc.integer({ min: 1000, max: 9999 })
  ).map(([a, b, c]) => `${a}-${b}-${c}`);

  /**
   * Arbitrary for generating valid industry sectors
   */
  const industryArb = fc.constantFrom(
    'Technology',
    'Healthcare',
    'Manufacturing',
    'Finance',
    'Energy',
    'Retail',
    'Agriculture',
    'Construction'
  );

  /**
   * Arbitrary for generating valid CSV row data
   */
  const csvRowArb: fc.Arbitrary<CSVRowData> = fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    ssn: ssnArb,
    annual_income: fc.integer({ min: 10000, max: 10000000 }).map(String),
    total_assets: fc.integer({ min: 0, max: 100000000 }).map(String),
    company: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    industry: industryArb,
  });

  /**
   * Arbitrary for generating arrays of CSV rows (batch input)
   */
  const batchRowsArb = fc.array(csvRowArb, { minLength: 1, maxLength: 50 });

  /**
   * Property 5.1: All rows are processed (results.length === totalRows)
   * **Validates: Requirements 5.5, 5.6**
   * 
   * For any batch of CSV rows, the number of results SHALL equal the number of input rows.
   */
  it('results.length MUST equal totalRows', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const { results, summary } = processBatch(rows);
        
        // Property: results.length === totalRows
        expect(results.length).toBe(rows.length);
        
        // Property: summary.totalProcessed === totalRows
        expect(summary.totalProcessed).toBe(rows.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.2: Summary counts match results
   * **Validates: Requirements 5.5, 5.6**
   * 
   * For any completed batch: 
   * - summary.totalProcessed MUST equal results.length
   * - approved + review + rejected + error MUST equal totalProcessed
   */
  it('summary.totalProcessed MUST equal results.length and counts MUST sum to totalProcessed', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const { results, summary } = processBatch(rows);
        
        // Count decisions from results
        const approvedFromResults = results.filter(r => r.decision === 'APPROVED' && !r.error).length;
        const reviewFromResults = results.filter(r => r.decision === 'REVIEW' && !r.error).length;
        const rejectedFromResults = results.filter(r => r.decision === 'REJECTED' && !r.error).length;
        const errorFromResults = results.filter(r => r.error !== undefined).length;
        
        // Property: summary counts match actual results
        expect(summary.approvedCount).toBe(approvedFromResults);
        expect(summary.reviewCount).toBe(reviewFromResults);
        expect(summary.rejectedCount).toBe(rejectedFromResults);
        expect(summary.errorCount).toBe(errorFromResults);
        
        // Property: sum of counts equals total processed (Requirement 4.5)
        const sumOfCounts = summary.approvedCount + summary.reviewCount + summary.rejectedCount + summary.errorCount;
        expect(sumOfCounts).toBe(summary.totalProcessed);
        
        // Property: validateSummaryCounts returns true
        expect(validateSummaryCounts(summary)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.3: Decisions match score thresholds (Property 2 thresholds)
   * **Validates: Requirements 5.5, 5.6**
   * 
   * For any result without error, decision MUST match the score using Property 2 thresholds:
   * - score > 750 → APPROVED
   * - 600 <= score <= 750 → REVIEW
   * - score < 600 → REJECTED
   */
  it('each result.decision MUST match score threshold (Property 2)', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const { results } = processBatch(rows);
        
        for (const result of results) {
          // Skip error results as they may have forced REJECTED decision
          if (result.error) continue;
          
          const score = result.compositeScore;
          const decision = result.decision;
          
          // Property: decision matches threshold
          if (score > 750) {
            expect(decision).toBe('APPROVED');
          } else if (score >= 600) {
            expect(decision).toBe('REVIEW');
          } else {
            expect(decision).toBe('REJECTED');
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.4: Each result has valid structure for display
   * **Validates: Requirements 5.5**
   * 
   * For any processed row, the result SHALL have valid rowIndex, borrowerName,
   * compositeScore (0-1000), decision, and processingTimeMs (>= 0) for table display.
   */
  it('each result has valid structure for results table display', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const { results } = processBatch(rows);
        
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          
          // Property: rowIndex matches position
          expect(result.rowIndex).toBe(i);
          
          // Property: borrowerName is present
          expect(result.borrowerName).toBeDefined();
          expect(typeof result.borrowerName).toBe('string');
          
          // Property: compositeScore is in valid range (0-1000)
          expect(result.compositeScore).toBeGreaterThanOrEqual(0);
          expect(result.compositeScore).toBeLessThanOrEqual(1000);
          
          // Property: decision is valid
          expect(['APPROVED', 'REVIEW', 'REJECTED']).toContain(result.decision);
          
          // Property: processingTimeMs is non-negative
          expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.5: Async batch processing produces same results as sync
   * **Validates: Requirements 5.5, 5.6**
   * 
   * For any batch, async processing SHALL produce equivalent results to sync processing.
   */
  it('async batch processing produces equivalent results', async () => {
    await fc.assert(
      fc.asyncProperty(batchRowsArb, async (rows) => {
        const syncResult = processBatch(rows);
        const asyncResult = await processBatchAsync(rows);
        
        // Property: same number of results
        expect(asyncResult.results.length).toBe(syncResult.results.length);
        
        // Property: same summary counts
        expect(asyncResult.summary.totalProcessed).toBe(syncResult.summary.totalProcessed);
        expect(asyncResult.summary.approvedCount).toBe(syncResult.summary.approvedCount);
        expect(asyncResult.summary.reviewCount).toBe(syncResult.summary.reviewCount);
        expect(asyncResult.summary.rejectedCount).toBe(syncResult.summary.rejectedCount);
        expect(asyncResult.summary.errorCount).toBe(syncResult.summary.errorCount);
        
        // Property: same decisions for each row
        for (let i = 0; i < syncResult.results.length; i++) {
          expect(asyncResult.results[i].decision).toBe(syncResult.results[i].decision);
          expect(asyncResult.results[i].compositeScore).toBe(syncResult.results[i].compositeScore);
        }
      }),
      { numRuns: 50 }
    );
  });

  /**
   * Property 5.6: Empty batch produces empty results
   * **Validates: Requirements 5.5, 5.6**
   * 
   * An empty batch SHALL produce zero results and zero counts.
   */
  it('empty batch produces empty results', () => {
    const { results, summary } = processBatch([]);
    
    expect(results.length).toBe(0);
    expect(summary.totalProcessed).toBe(0);
    expect(summary.approvedCount).toBe(0);
    expect(summary.reviewCount).toBe(0);
    expect(summary.rejectedCount).toBe(0);
    expect(summary.errorCount).toBe(0);
    expect(validateSummaryCounts(summary)).toBe(true);
  });

  /**
   * Property 5.7: Progress callback is called for each row
   * **Validates: Requirements 5.5**
   * 
   * For any batch, the progress callback SHALL be called exactly once per row
   * with correct progress values.
   */
  it('progress callback is called for each row', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const progressCalls: Array<{ processed: number; total: number }> = [];
        
        processBatch(rows, (processed, total) => {
          progressCalls.push({ processed, total });
        });
        
        // Property: callback called once per row
        expect(progressCalls.length).toBe(rows.length);
        
        // Property: progress values are correct
        for (let i = 0; i < progressCalls.length; i++) {
          expect(progressCalls[i].processed).toBe(i + 1);
          expect(progressCalls[i].total).toBe(rows.length);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5.8: Processing is deterministic for same input
   * **Validates: Requirements 5.5, 5.6**
   * 
   * For any batch, processing the same input twice SHALL produce identical results.
   */
  it('processing is deterministic for same input', () => {
    fc.assert(
      fc.property(batchRowsArb, (rows) => {
        const result1 = processBatch(rows);
        const result2 = processBatch(rows);
        
        // Property: same number of results
        expect(result1.results.length).toBe(result2.results.length);
        
        // Property: same decisions and scores
        for (let i = 0; i < result1.results.length; i++) {
          expect(result1.results[i].compositeScore).toBe(result2.results[i].compositeScore);
          expect(result1.results[i].decision).toBe(result2.results[i].decision);
          expect(result1.results[i].borrowerName).toBe(result2.results[i].borrowerName);
        }
        
        // Property: same summary counts
        expect(result1.summary.approvedCount).toBe(result2.summary.approvedCount);
        expect(result1.summary.reviewCount).toBe(result2.summary.reviewCount);
        expect(result1.summary.rejectedCount).toBe(result2.summary.rejectedCount);
        expect(result1.summary.errorCount).toBe(result2.summary.errorCount);
      }),
      { numRuns: 100 }
    );
  });
});
