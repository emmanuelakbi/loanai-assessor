/**
 * Batch Processor Service
 * 
 * Processes CSV data rows for bulk loan assessments, producing BatchResult and BatchSummary.
 * 
 * Requirements:
 * - 2.4: BatchProgressBar SHALL update in real-time
 * - 4.5: BatchSummary counts SHALL equal total processed
 */

import type { BatchResult, BatchSummary, LoanDecision } from '../types';
import { 
  calculateCompositeScore, 
  calculateIncomeAssetsScore
} from './scoringEngine';
import { getCreditScoreSync } from './mockCreditBureau';
import { getESGScoreSync } from './mockESGProvider';

/**
 * Parsed CSV row data for batch processing
 */
export interface CSVRowData {
  name: string;
  ssn: string;
  annual_income: string;
  total_assets: string;
  company: string;
  industry: string;
}

/**
 * Progress callback for real-time updates
 * Requirements: 2.4 - BatchProgressBar SHALL update in real-time
 */
export type ProgressCallback = (processedRows: number, totalRows: number) => void;

/**
 * Process a single CSV row and return a BatchResult
 * 
 * @param row - Parsed CSV row data
 * @param rowIndex - Index of the row in the CSV (0-based)
 * @returns BatchResult with score, decision, and processing time
 */
export function processRow(row: CSVRowData, rowIndex: number): BatchResult {
  const startTime = performance.now();
  
  try {
    // Parse numeric values
    const annualIncome = parseFloat(row.annual_income) || 0;
    const totalAssets = parseFloat(row.total_assets) || 0;
    
    // Get credit score (synchronous for batch processing)
    const creditScore = getCreditScoreSync(row.ssn);
    
    // Get ESG score (synchronous for batch processing)
    const esgScore = getESGScoreSync(row.company, row.industry);
    
    // Calculate income/assets score
    const incomeAssetsScore = calculateIncomeAssetsScore(annualIncome, totalAssets);
    
    // Calculate composite score
    const compositeScore = calculateCompositeScore(
      { score: creditScore },
      { score: incomeAssetsScore.score },
      { total: esgScore }
    );
    
    const processingTimeMs = Math.round(performance.now() - startTime);
    
    return {
      rowIndex,
      borrowerName: row.name,
      compositeScore: compositeScore.total,
      decision: compositeScore.decision,
      processingTimeMs,
    };
  } catch (error) {
    const processingTimeMs = Math.round(performance.now() - startTime);
    
    return {
      rowIndex,
      borrowerName: row.name || `Row ${rowIndex + 1}`,
      compositeScore: 0,
      decision: 'REJECTED' as LoanDecision,
      processingTimeMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate BatchSummary from results
 * 
 * Requirements:
 * - 4.5: BatchSummary counts SHALL equal total processed
 * 
 * @param results - Array of BatchResult from processing
 * @param totalTimeMs - Total processing time in milliseconds
 * @returns BatchSummary with counts and timing
 */
export function calculateSummary(results: BatchResult[], totalTimeMs: number): BatchSummary {
  const approvedCount = results.filter(r => r.decision === 'APPROVED' && !r.error).length;
  const reviewCount = results.filter(r => r.decision === 'REVIEW' && !r.error).length;
  const rejectedCount = results.filter(r => r.decision === 'REJECTED' && !r.error).length;
  const errorCount = results.filter(r => r.error !== undefined).length;
  
  // Total processed = approved + review + rejected + errors
  // This ensures Requirement 4.5: counts SHALL equal total processed
  const totalProcessed = approvedCount + reviewCount + rejectedCount + errorCount;
  
  const averageTimeMs = totalProcessed > 0 
    ? Math.round(totalTimeMs / totalProcessed) 
    : 0;
  
  return {
    totalProcessed,
    approvedCount,
    reviewCount,
    rejectedCount,
    errorCount,
    totalTimeMs,
    averageTimeMs,
  };
}

/**
 * Process all CSV rows in batch
 * 
 * Requirements:
 * - 2.4: BatchProgressBar SHALL update in real-time (via onProgress callback)
 * - 4.5: BatchSummary counts SHALL equal total processed
 * 
 * @param rows - Array of parsed CSV row data
 * @param onProgress - Optional callback for real-time progress updates
 * @returns Object containing results array and summary
 */
export function processBatch(
  rows: CSVRowData[],
  onProgress?: ProgressCallback
): { results: BatchResult[]; summary: BatchSummary } {
  const startTime = performance.now();
  const results: BatchResult[] = [];
  
  for (let i = 0; i < rows.length; i++) {
    const result = processRow(rows[i], i);
    results.push(result);
    
    // Call progress callback for real-time updates (Requirement 2.4)
    if (onProgress) {
      onProgress(i + 1, rows.length);
    }
  }
  
  const totalTimeMs = Math.round(performance.now() - startTime);
  const summary = calculateSummary(results, totalTimeMs);
  
  return { results, summary };
}

/**
 * Process batch asynchronously with chunked processing
 * Allows UI to update between chunks for better responsiveness
 * 
 * Requirements:
 * - 2.4: BatchProgressBar SHALL update in real-time
 * - 4.5: BatchSummary counts SHALL equal total processed
 * 
 * @param rows - Array of parsed CSV row data
 * @param onProgress - Optional callback for real-time progress updates
 * @param chunkSize - Number of rows to process per chunk (default: 10)
 * @returns Promise resolving to results and summary
 */
export async function processBatchAsync(
  rows: CSVRowData[],
  onProgress?: ProgressCallback,
  chunkSize: number = 10
): Promise<{ results: BatchResult[]; summary: BatchSummary }> {
  const startTime = performance.now();
  const results: BatchResult[] = [];
  
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, Math.min(i + chunkSize, rows.length));
    
    for (let j = 0; j < chunk.length; j++) {
      const rowIndex = i + j;
      const result = processRow(chunk[j], rowIndex);
      results.push(result);
      
      // Call progress callback for real-time updates (Requirement 2.4)
      if (onProgress) {
        onProgress(rowIndex + 1, rows.length);
      }
    }
    
    // Yield to event loop between chunks for UI responsiveness
    if (i + chunkSize < rows.length) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  const totalTimeMs = Math.round(performance.now() - startTime);
  const summary = calculateSummary(results, totalTimeMs);
  
  return { results, summary };
}

/**
 * Validate that summary counts equal total processed
 * Utility function for testing Requirement 4.5
 * 
 * @param summary - BatchSummary to validate
 * @returns true if counts are consistent
 */
export function validateSummaryCounts(summary: BatchSummary): boolean {
  const sumOfCounts = 
    summary.approvedCount + 
    summary.reviewCount + 
    summary.rejectedCount + 
    summary.errorCount;
  
  return sumOfCounts === summary.totalProcessed;
}
