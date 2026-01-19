import React, { useState, useCallback } from 'react';
import { CSVDropzone } from '../components/CSVDropzone';
import { BatchProgressBar } from '../components/BatchProgressBar';
import { BatchResultsTable } from '../components/BatchResultsTable';
import { BatchSummary } from '../components/BatchSummary';
import { EfficiencyMetrics } from '../components/EfficiencyMetrics';
import { processBatchAsync, type CSVRowData } from '../services/batchProcessor';
import type { BatchJob } from '../types';

/**
 * BatchProcessorScreen - Main screen for batch loan processing via CSV upload
 * 
 * Requirements:
 * - 1.1: Display a CSV upload dropzone with drag-and-drop
 * - 2.1: Display a progress bar when processing begins
 * - 3.1: Display results table when processing completes
 * - 4.1: Display total processed count in BatchSummary
 * 
 * Architecture:
 * - CSVDropzone: File upload with drag-and-drop
 * - BatchProgressBar: Progress indicator during processing
 * - BatchResultsTable: Virtualized results table
 * - BatchSummary: Summary statistics cards
 * - EfficiencyMetrics: Manual vs AI time comparison
 * - ExportButton: CSV export functionality
 */
export const BatchProcessorScreen: React.FC = () => {
  // State for batch job tracking
  const [batchJob, setBatchJob] = useState<BatchJob | null>(null);
  const [csvData, setCsvData] = useState<CSVRowData[] | null>(null);

  /**
   * Handle CSV file loaded from dropzone
   * Requirement 1.1, 1.4: Display filename and row count when valid CSV uploaded
   */
  const handleFileLoaded = useCallback((
    data: Record<string, string>[],
    fileName: string,
    rowCount: number
  ) => {
    // Convert to CSVRowData format - the CSV validator ensures these fields exist
    const rows = data.map(row => ({
      name: row.name || '',
      ssn: row.ssn || '',
      annual_income: row.annual_income || '',
      total_assets: row.total_assets || '',
      company: row.company || '',
      industry: row.industry || '',
    })) as CSVRowData[];
    setCsvData(rows);
    
    // Initialize batch job
    const newJob: BatchJob = {
      id: crypto.randomUUID(),
      fileName,
      totalRows: rowCount,
      processedRows: 0,
      results: [],
      status: 'validating',
      startedAt: new Date(),
    };
    setBatchJob(newJob);
  }, []);

  /**
   * Handle CSV validation/parsing errors
   */
  const handleError = useCallback((error: string) => {
    if (batchJob) {
      setBatchJob({
        ...batchJob,
        status: 'error',
      });
    }
    console.error('CSV Error:', error);
  }, [batchJob]);

  /**
   * Start batch processing
   * Requirements 2.1-2.4: Display progress bar with real-time updates
   */
  const handleStartProcessing = useCallback(async () => {
    if (!csvData || !batchJob) return;

    // Update status to processing
    setBatchJob(prev => prev ? { ...prev, status: 'processing' } : null);

    try {
      // Process batch with progress callback for real-time updates (Requirement 2.4)
      const { results, summary } = await processBatchAsync(
        csvData,
        (processedRows, _totalRows) => {
          setBatchJob(prev => prev ? {
            ...prev,
            processedRows,
            status: 'processing',
          } : null);
        }
      );

      // Update job with results (Requirements 3.1, 4.1)
      setBatchJob(prev => prev ? {
        ...prev,
        processedRows: results.length,
        results,
        status: 'complete',
        completedAt: new Date(),
        summary,
      } : null);
    } catch (error) {
      setBatchJob(prev => prev ? {
        ...prev,
        status: 'error',
      } : null);
      console.error('Processing error:', error);
    }
  }, [csvData, batchJob]);

  /**
   * Reset to initial state for new batch
   */
  const handleReset = useCallback(() => {
    setBatchJob(null);
    setCsvData(null);
  }, []);

  /**
   * Export results to CSV
   * Requirements 6.1, 6.2: Export Results button downloads CSV with all results
   */
  const handleExportResults = useCallback(() => {
    if (!batchJob?.results || batchJob.results.length === 0) return;

    // Build CSV content
    const headers = ['Row', 'Borrower Name', 'Composite Score', 'Decision', 'Processing Time (ms)', 'Error'];
    const rows = batchJob.results.map(result => [
      result.rowIndex + 1,
      result.borrowerName,
      result.compositeScore,
      result.decision,
      result.processingTimeMs,
      result.error || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-results-${batchJob.fileName.replace('.csv', '')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [batchJob]);

  // Determine current view state
  const isIdle = !batchJob;
  const isValidating = batchJob?.status === 'validating';
  const isProcessing = batchJob?.status === 'processing';
  const isComplete = batchJob?.status === 'complete';
  const isError = batchJob?.status === 'error';

  return (
    <div className="p-8 space-y-6" data-testid="batch-processor-screen">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Batch Processor</h1>
        <p className="text-gray-600 mt-1">
          Upload a CSV file to process multiple loan applications at once
        </p>
      </div>

      {/* CSV Upload Section - Requirement 1.1 */}
      {(isIdle || isValidating || isError) && (
        <section aria-label="CSV Upload">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload CSV File</h2>
            <CSVDropzone
              onFileLoaded={handleFileLoaded}
              onError={handleError}
              disabled={isProcessing}
            />
            
            {/* Show file info and start button when file is loaded */}
            {isValidating && csvData && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Ready to process <span className="font-medium">{csvData.length}</span> loan applications
                </div>
                <button
                  onClick={handleStartProcessing}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  data-testid="start-processing-button"
                >
                  Start Processing
                </button>
              </div>
            )}

            {/* Error state */}
            {isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">An error occurred during processing. Please try again.</p>
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Reset and try again
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Progress Section - Requirement 2.1 */}
      {isProcessing && batchJob && (
        <section aria-label="Processing Progress">
          <BatchProgressBar job={batchJob} />
        </section>
      )}

      {/* Results Section - Requirements 3.1, 4.1, 5.1-5.3 */}
      {isComplete && batchJob && batchJob.summary && (
        <>
          {/* Summary Statistics - Requirement 4.1 */}
          <section aria-label="Batch Summary">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Processing Summary</h2>
              <BatchSummary
                totalProcessed={batchJob.summary.totalProcessed}
                approvedCount={batchJob.summary.approvedCount}
                reviewCount={batchJob.summary.reviewCount}
                rejectedCount={batchJob.summary.rejectedCount}
                errorCount={batchJob.summary.errorCount}
              />
            </div>
          </section>

          {/* Efficiency Metrics - Requirements 5.1-5.3 */}
          <section aria-label="Efficiency Metrics">
            <EfficiencyMetrics
              totalProcessed={batchJob.summary.totalProcessed}
              totalTimeMs={batchJob.summary.totalTimeMs}
            />
          </section>

          {/* Results Table - Requirement 3.1 */}
          <section aria-label="Batch Results">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Results</h2>
                <div className="flex gap-3">
                  {/* Export Button - Requirements 6.1, 6.2 */}
                  <button
                    onClick={handleExportResults}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                    data-testid="export-results-button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export Results
                  </button>
                  {/* New Batch Button */}
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                    data-testid="new-batch-button"
                  >
                    New Batch
                  </button>
                </div>
              </div>
              <BatchResultsTable
                results={batchJob.results}
                height={500}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default BatchProcessorScreen;
