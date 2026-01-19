import React from 'react';
import type { Assessment, LoanDecision } from '../../types';

export interface RecentAssessmentsProps {
  /** Array of assessments to display */
  assessments: Assessment[];
  /** Maximum number of assessments to show (default: 10) */
  maxItems?: number;
}

/**
 * Formats a date as a relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return diffSeconds === 1 ? '1 second ago' : `${diffSeconds} seconds ago`;
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
}

/**
 * Returns the appropriate CSS classes for a decision badge
 */
function getDecisionBadgeClasses(decision: LoanDecision): string {
  const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
  
  switch (decision) {
    case 'APPROVED':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'REVIEW':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'REJECTED':
      return `${baseClasses} bg-red-100 text-red-800`;
    default:
      return baseClasses;
  }
}

/**
 * RecentAssessments - Displays a table of recent loan assessments
 * 
 * Requirements:
 * - 3.1: Display table of recent assessments (max 10)
 * - 3.2: Show: Name, Score, Decision, Time (relative)
 * - 3.3: Highlight row on hover
 * - 3.4: Display most recent first
 */
export const RecentAssessments: React.FC<RecentAssessmentsProps> = ({
  assessments,
  maxItems = 10,
}) => {
  // Sort by most recent first and limit to maxItems (Requirement 3.4, 3.1)
  const sortedAssessments = [...assessments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxItems);

  if (sortedAssessments.length === 0) {
    return (
      <div
        className="bg-white rounded-xl shadow-md p-6"
        data-testid="recent-assessments"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Assessments
        </h2>
        <p className="text-gray-500 text-center py-8">
          No assessments yet
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6"
      data-testid="recent-assessments"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Assessments
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="assessments-table">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Score
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Decision
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAssessments.map((assessment) => (
              <tr
                key={assessment.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                data-testid="assessment-row"
              >
                <td className="py-3 px-4 text-sm text-gray-900">
                  {assessment.borrower.fullName}
                </td>
                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                  {assessment.compositeScore.total}
                </td>
                <td className="py-3 px-4">
                  <span className={getDecisionBadgeClasses(assessment.compositeScore.decision)}>
                    {assessment.compositeScore.decision}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatRelativeTime(new Date(assessment.createdAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAssessments;
