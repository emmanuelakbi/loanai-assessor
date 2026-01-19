import React, { useState, useCallback } from 'react';
import type { BatchResult, LoanDecision } from '../../types';

export interface BatchResultsTableProps {
  /** Array of batch processing results */
  results: BatchResult[];
  /** Height of the table container in pixels */
  height?: number;
  /** Width of the table container in pixels or '100%' */
  width?: number | string;
}

// Decision color mapping
const DECISION_COLORS: Record<LoanDecision, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
};

// Decision emoji indicators
const DECISION_EMOJI: Record<LoanDecision, string> = {
  APPROVED: '🟢',
  REVIEW: '🟡',
  REJECTED: '🔴',
};

// Row heights
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 48;

/**
 * Calculate score breakdown from composite score
 * Based on weights: Credit 40%, Income/Assets 30%, ESG 30%
 */
function calculateScoreBreakdown(compositeScore: number): {
  creditComponent: number;
  incomeComponent: number;
  esgComponent: number;
} {
  const creditComponent = Math.round(compositeScore * 0.4);
  const incomeComponent = Math.round(compositeScore * 0.3);
  const esgComponent = compositeScore - creditComponent - incomeComponent;
  
  return {
    creditComponent: Math.min(400, creditComponent),
    incomeComponent: Math.min(300, incomeComponent),
    esgComponent: Math.min(300, esgComponent),
  };
}

/**
 * Format processing time in milliseconds to human-readable format
 */
function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

interface RowProps {
  result: BatchResult;
  isExpanded: boolean;
  onRowClick: (rowIndex: number) => void;
}

/**
 * Individual row component
 */
const ResultRow: React.FC<RowProps> = ({ result, isExpanded, onRowClick }) => {
  const decisionColors = DECISION_COLORS[result.decision];
  const breakdown = calculateScoreBreakdown(result.compositeScore);

  const handleClick = () => {
    onRowClick(result.rowIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRowClick(result.rowIndex);
    }
  };

  return (
    <div
      className={`flex flex-col border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
        isExpanded ? 'bg-gray-50' : ''
      }`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="row"
      tabIndex={0}
      aria-expanded={isExpanded}
      data-testid={`batch-result-row-${result.rowIndex}`}
    >
      {/* Main row content */}
      <div className="flex items-center px-4" style={{ height: ROW_HEIGHT }}>
        {/* Expand indicator */}
        <div className="w-6 flex-shrink-0">
          <span
            className={`text-gray-400 transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}
          >
            ▶
          </span>
        </div>
        
        {/* Borrower Name */}
        <div className="flex-1 min-w-0 pr-4" data-testid={`borrower-name-${result.rowIndex}`}>
          <span className="font-medium text-gray-900 truncate block">
            {result.borrowerName}
          </span>
          {result.error && (
            <span className="text-xs text-red-500 truncate block">
              Error: {result.error}
            </span>
          )}
        </div>
        
        {/* Score */}
        <div className="w-20 text-center" data-testid={`score-${result.rowIndex}`}>
          <span className="font-semibold text-gray-900">{result.compositeScore}</span>
        </div>
        
        {/* Decision */}
        <div className="w-32 text-center" data-testid={`decision-${result.rowIndex}`}>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${decisionColors.bg} ${decisionColors.text}`}
          >
            <span>{DECISION_EMOJI[result.decision]}</span>
            {result.decision}
          </span>
        </div>
        
        {/* Processing Time */}
        <div className="w-24 text-right" data-testid={`processing-time-${result.rowIndex}`}>
          <span className="text-gray-600 text-sm">
            {formatProcessingTime(result.processingTimeMs)}
          </span>
        </div>
      </div>
      
      {/* Expanded content - Score breakdown */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100"
          data-testid={`score-breakdown-${result.rowIndex}`}
        >
          <div className="ml-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Score Breakdown</h4>
            <div className="grid grid-cols-3 gap-4">
              {/* Credit Component */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Credit (40%)</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-blue-600">
                    {breakdown.creditComponent}
                  </span>
                  <span className="text-xs text-gray-400">/ 400</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(breakdown.creditComponent / 400) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Income/Assets Component */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Income/Assets (30%)</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-green-600">
                    {breakdown.incomeComponent}
                  </span>
                  <span className="text-xs text-gray-400">/ 300</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(breakdown.incomeComponent / 300) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* ESG Component */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">ESG (30%)</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-purple-600">
                    {breakdown.esgComponent}
                  </span>
                  <span className="text-xs text-gray-400">/ 300</span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(breakdown.esgComponent / 300) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * BatchResultsTable - Displays batch processing results with scrolling
 * 
 * Requirements:
 * - 5.5: Display results table with columns: Borrower, Score, Decision, Processing Time
 * - 5.8: Expand row on click to show individual score breakdown
 * - Supports 1000+ rows with overflow scrolling
 * 
 * @validates Requirements 5.5, 5.8
 */
export const BatchResultsTable: React.FC<BatchResultsTableProps> = ({
  results,
  height = 500,
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleRowClick = useCallback((rowIndex: number) => {
    setExpandedRow((prev) => (prev === rowIndex ? null : rowIndex));
  }, []);

  if (results.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200"
        data-testid="batch-results-empty"
      >
        <p className="text-gray-500">No results to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden" data-testid="batch-results-table">
      {/* Table Header */}
      <div
        className="flex items-center px-4 bg-gray-100 border-b border-gray-200 font-medium text-gray-700 text-sm"
        style={{ height: HEADER_HEIGHT }}
        role="row"
      >
        <div className="w-6 flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-4">Borrower</div>
        <div className="w-20 text-center">Score</div>
        <div className="w-32 text-center">Decision</div>
        <div className="w-24 text-right">Time</div>
      </div>
      
      {/* Scrollable Results List */}
      <div 
        className="overflow-y-auto"
        style={{ height: height - HEADER_HEIGHT - 40 }}
      >
        {results.map((result) => (
          <ResultRow
            key={result.rowIndex}
            result={result}
            isExpanded={expandedRow === result.rowIndex}
            onRowClick={handleRowClick}
          />
        ))}
      </div>
      
      {/* Results count footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Showing {results.length.toLocaleString()} results
      </div>
    </div>
  );
};

export default BatchResultsTable;
