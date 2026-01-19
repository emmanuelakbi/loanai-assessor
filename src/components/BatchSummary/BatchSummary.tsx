import React from 'react';

export interface BatchSummaryProps {
  /** Total number of processed applications */
  totalProcessed: number;
  /** Number of approved applications */
  approvedCount: number;
  /** Number of applications requiring review */
  reviewCount: number;
  /** Number of rejected applications */
  rejectedCount: number;
  /** Number of applications with errors (optional) */
  errorCount?: number;
  /** Total processing time in milliseconds (optional) */
  totalTimeMs?: number;
  /** Average processing time per application in milliseconds (optional) */
  averageTimeMs?: number;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  colorClass: string;
  borderColorClass: string;
  testId: string;
}

/**
 * Formats milliseconds to a human-readable time string
 */
const formatTime = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = ms / 1000;
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(1)} hrs`;
};

/**
 * Calculates manual processing time (5 minutes per application)
 * @param count Number of applications
 * @returns Time in hours
 */
const calculateManualTimeHours = (count: number): number => {
  const MINUTES_PER_APPLICATION = 5;
  return (count * MINUTES_PER_APPLICATION) / 60;
};

/**
 * Calculates AI processing time in hours
 * @param count Number of applications
 * @param avgTimeMs Average time per application in milliseconds (default 30s)
 * @returns Time in hours
 */
const calculateAITimeHours = (count: number, avgTimeMs: number = 30000): number => {
  const totalMs = count * avgTimeMs;
  return totalMs / (1000 * 60 * 60);
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, colorClass, borderColorClass, testId }) => (
  <div
    className={`rounded-lg p-4 flex flex-col items-center justify-center w-[150px] h-[100px] border-l-4 ${colorClass} ${borderColorClass}`}
    data-testid={testId}
  >
    <span className="text-2xl font-bold" data-testid={`${testId}-value`}>
      {value}
    </span>
    <span className="text-xs font-medium mt-1 text-center" data-testid={`${testId}-label`}>
      {title}
    </span>
  </div>
);

/**
 * BatchSummary - Displays summary statistics cards for batch processing results
 *
 * Requirements:
 * - 5.6: Display summary metrics: Total Processed, Approved Count, Review Count, Rejected Count, Total Time
 * - 5.7: Display efficiency comparison: "1000 loans: Manual 5min×1000=83hrs vs AI 30s×1000=8.3hrs"
 */
export const BatchSummary: React.FC<BatchSummaryProps> = ({
  totalProcessed,
  approvedCount,
  reviewCount,
  rejectedCount,
  errorCount = 0,
  totalTimeMs = 0,
  averageTimeMs = 30000, // Default 30 seconds per application
}) => {
  // Calculate efficiency comparison values
  const manualTimeHours = calculateManualTimeHours(totalProcessed);
  const aiTimeHours = calculateAITimeHours(totalProcessed, averageTimeMs);

  return (
    <div className="space-y-6" data-testid="batch-summary">
      {/* Summary Section Title */}
      <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
      
      {/* Summary Cards - Requirement 5.6 */}
      <div className="flex flex-wrap gap-4" data-testid="summary-cards">
        {/* Total Processed */}
        <SummaryCard
          title="Processed"
          value={totalProcessed}
          colorClass="bg-blue-50 text-blue-800"
          borderColorClass="border-blue-500"
          testId="summary-total"
        />

        {/* Approved (green) */}
        <SummaryCard
          title="Approved"
          value={approvedCount}
          colorClass="bg-green-50 text-green-800"
          borderColorClass="border-green-500"
          testId="summary-approved"
        />

        {/* Review (yellow/amber) */}
        <SummaryCard
          title="Review"
          value={reviewCount}
          colorClass="bg-amber-50 text-amber-800"
          borderColorClass="border-amber-500"
          testId="summary-review"
        />

        {/* Rejected (red) */}
        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          colorClass="bg-red-50 text-red-800"
          borderColorClass="border-red-500"
          testId="summary-rejected"
        />

        {/* Errors (optional, shown only if there are errors) */}
        {errorCount > 0 && (
          <SummaryCard
            title="Errors"
            value={errorCount}
            colorClass="bg-gray-50 text-gray-800"
            borderColorClass="border-gray-500"
            testId="summary-errors"
          />
        )}
      </div>

      {/* Total Time Display - Requirement 5.6 */}
      {totalTimeMs > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600" data-testid="total-time">
          <span className="font-medium">Total Processing Time:</span>
          <span className="font-bold text-blue-600" data-testid="total-time-value">
            {formatTime(totalTimeMs)}
          </span>
        </div>
      )}

      {/* Efficiency Comparison - Requirement 5.7 */}
      <div 
        className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200"
        data-testid="efficiency-comparison"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-gray-800">Efficiency Comparison</span>
        </div>
        <div className="text-sm text-gray-700" data-testid="efficiency-text">
          <span className="font-medium">{totalProcessed.toLocaleString()} loans:</span>{' '}
          <span className="text-red-600">
            Manual 5min×{totalProcessed.toLocaleString()}=
            <span className="font-bold">{manualTimeHours.toFixed(1)}hrs</span>
          </span>
          {' vs '}
          <span className="text-green-600">
            AI 30s×{totalProcessed.toLocaleString()}=
            <span className="font-bold">{aiTimeHours.toFixed(1)}hrs</span>
          </span>
          {' '}
          <span className="text-blue-600 font-bold">
            ({Math.round(((manualTimeHours - aiTimeHours) / manualTimeHours) * 100)}% ↓)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BatchSummary;
