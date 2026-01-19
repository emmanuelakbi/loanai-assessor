import React, { useState } from 'react';
import type { Assessment, LoanDecision } from '../../types';
import { TableRowSkeleton } from '../Skeleton';

export interface RecentAssessmentsProps {
  /** List of assessments to display */
  assessments: Assessment[];
  /** Maximum number of assessments to show (default: 10) */
  maxItems?: number;
  /** Callback when View Details is clicked */
  onViewDetails?: (assessment: Assessment) => void;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * Get decision indicator emoji and label based on loan decision
 */
const getDecisionIndicator = (decision: LoanDecision): { emoji: string; label: string; colorClass: string } => {
  switch (decision) {
    case 'APPROVED':
      return { emoji: '🟢', label: 'APPR', colorClass: 'text-green-600' };
    case 'REVIEW':
      return { emoji: '🟡', label: 'REV', colorClass: 'text-amber-500' };
    case 'REJECTED':
      return { emoji: '🔴', label: 'REJ', colorClass: 'text-red-500' };
    default:
      return { emoji: '⚪', label: 'N/A', colorClass: 'text-gray-400' };
  }
};

/**
 * Format relative time from date (e.g., "2min ago", "1hr ago")
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}min ago`;
  } else if (diffHours < 24) {
    return `${diffHours}hr ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

/**
 * RecentAssessments - Table component displaying recent loan assessments
 * 
 * Design Specifications:
 * - Table with columns: Name, Score, Decision, Time
 * - Decision indicators: 🟢 APPROVED, 🟡 REVIEW, 🔴 REJECTED
 * - Row hover highlighting with View Details action
 * - Fintech color scheme: #1E3A8A primary blue, #F8FAFC background white
 * 
 * Requirements:
 * - 1.2: WHEN the Dashboard loads, THE LoanAI_System SHALL display a summary 
 *        of recent assessments with borrower name, score, and decision status
 * - 1.5: WHEN hovering over a recent assessment row, THE Dashboard SHALL 
 *        highlight the row and show a "View Details" action
 */
export const RecentAssessments: React.FC<RecentAssessmentsProps> = ({
  assessments,
  maxItems = 10,
  onViewDetails,
  isLoading = false,
}) => {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Get the most recent assessments up to maxItems
  const recentAssessments = assessments.slice(0, maxItems);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      data-testid="recent-assessments"
      role="region"
      aria-label="Recent Assessments"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          Recent Assessments
        </h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Recent assessments table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Score
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Decision
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                Time
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                scope="col"
              >
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableRowSkeleton columns={5} rows={3} />
            ) : recentAssessments.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-gray-500"
                  data-testid="empty-state"
                >
                  No recent assessments
                </td>
              </tr>
            ) : (
              recentAssessments.map((assessment) => {
                const decision = assessment.compositeScore?.decision;
                const indicator = getDecisionIndicator(decision);
                const isHovered = hoveredRowId === assessment.id;

                return (
                  <tr
                    key={assessment.id}
                    className={`transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${
                      isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onMouseEnter={() => setHoveredRowId(assessment.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    onFocus={() => setHoveredRowId(assessment.id)}
                    onBlur={() => setHoveredRowId(null)}
                    data-testid={`assessment-row-${assessment.id}`}
                    role="row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewDetails?.(assessment);
                      }
                    }}
                    aria-label={`Assessment for ${assessment.borrower.fullName}, Score: ${assessment.compositeScore?.total || 'N/A'}, Decision: ${indicator.label}`}
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.borrower.fullName}
                      </div>
                    </td>

                    {/* Score Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#1E3A8A]">
                        {assessment.compositeScore?.total ?? 'N/A'}
                      </div>
                    </td>

                    {/* Decision Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${indicator.colorClass}`}
                        data-testid={`decision-${assessment.id}`}
                      >
                        <span aria-hidden="true">{indicator.emoji}</span>
                        <span>{indicator.label}</span>
                      </span>
                    </td>

                    {/* Time Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(assessment.createdAt)}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className={`text-sm font-medium text-[#1E3A8A] hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded px-2 py-1 transition-opacity duration-200 ${
                          isHovered ? 'opacity-100' : 'opacity-0 focus:opacity-100'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails?.(assessment);
                        }}
                        data-testid={`view-details-${assessment.id}`}
                        aria-label={`View details for ${assessment.borrower.fullName}`}
                        tabIndex={0}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAssessments;
