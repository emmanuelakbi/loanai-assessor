import React from 'react';
import type { BatchJob } from '../../types';

export interface BatchProgressBarProps {
  /** The batch job to display progress for */
  job: BatchJob;
}

/**
 * BatchProgressBar - Displays processing progress with percentage and loan count
 * 
 * Design Specifications:
 * - Progress Bar: 100% width, 32px height, animated stripe pattern
 * 
 * Requirements:
 * - 5.4: WHEN processing begins, THE Batch_Processor SHALL display a progress bar 
 *        with percentage and "Processing loan X of Y" message
 */
export const BatchProgressBar: React.FC<BatchProgressBarProps> = ({ job }) => {
  const { processedRows, totalRows, status, fileName } = job;
  
  // Calculate percentage (0-100), handle edge case of 0 total rows
  const percentage = totalRows > 0 
    ? Math.round((processedRows / totalRows) * 100) 
    : 0;
  
  // Determine if we're actively processing
  const isProcessing = status === 'processing';
  const isComplete = status === 'complete';
  const isError = status === 'error';
  
  // Get status text based on current state
  const getStatusText = (): string => {
    switch (status) {
      case 'uploading':
        return 'Uploading file...';
      case 'validating':
        return 'Validating CSV...';
      case 'processing':
        return `Processing loan ${processedRows} of ${totalRows}`;
      case 'complete':
        return `Completed processing ${totalRows} loans`;
      case 'error':
        return 'Processing error occurred';
      default:
        return 'Preparing...';
    }
  };

  // Get progress bar color based on status
  const getProgressBarColor = (): string => {
    if (isError) return 'bg-red-500';
    if (isComplete) return 'bg-green-500';
    return 'bg-blue-600';
  };

  // Get background color for the progress track
  const getTrackColor = (): string => {
    if (isError) return 'bg-red-100';
    if (isComplete) return 'bg-green-100';
    return 'bg-gray-200';
  };

  // Animated stripe pattern styles for the progress bar fill
  const stripeStyles: React.CSSProperties = {
    width: `${percentage}%`,
    backgroundImage: isProcessing 
      ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)'
      : 'none',
    backgroundSize: '1rem 1rem',
    animation: isProcessing ? 'progress-stripe 1s linear infinite' : 'none',
  };

  return (
    <div 
      className="w-full bg-white rounded-lg shadow-md p-6"
      data-testid="batch-progress-bar"
    >
      {/* CSS animation for stripe pattern */}
      <style>
        {`
          @keyframes progress-stripe {
            0% { background-position: 1rem 0; }
            100% { background-position: 0 0; }
          }
        `}
      </style>

      {/* Header with filename and percentage */}
      <div className="flex justify-between items-center mb-3">
        <span 
          className="text-sm font-medium text-gray-700 truncate max-w-[60%]"
          data-testid="batch-filename"
          title={fileName}
        >
          {fileName}
        </span>
        <span 
          className="text-lg font-bold text-gray-900"
          data-testid="batch-percentage"
        >
          {percentage}%
        </span>
      </div>

      {/* Progress bar - 32px height as per design spec */}
      <div 
        className={`w-full h-8 rounded-lg overflow-hidden ${getTrackColor()}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Processing progress: ${percentage}%`}
        data-testid="batch-progress-track"
      >
        <div
          className={`h-full rounded-lg transition-all duration-300 ease-out ${getProgressBarColor()}`}
          style={stripeStyles}
          data-testid="batch-progress-fill"
        />
      </div>

      {/* Status text - "Processing loan X of Y" */}
      <div className="mt-4 flex justify-between items-center">
        <span 
          className="text-base font-medium text-gray-700"
          data-testid="batch-status-text"
        >
          {getStatusText()}
        </span>
        
        {/* Show processed/total count */}
        <span 
          className="text-sm text-gray-500"
          data-testid="batch-count"
        >
          {processedRows} / {totalRows}
        </span>
      </div>

      {/* Animated processing indicator dots */}
      {isProcessing && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-blue-600 font-medium">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default BatchProgressBar;
