import React from 'react';
import { MetricCard } from '../MetricCard';

export interface DashboardMetrics {
  todayAssessments: number;
  approvalRate: number;
  averageTimeSeconds: number;
  timeSavedPercent: number;
}

export interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

/**
 * MetricsCards - Container component that displays all four dashboard metric cards
 * 
 * Requirements:
 * - 2.1: Display "Today's Assessments" count
 * - 2.2: Display "Approval Rate" percentage
 * - 2.3: Display "Average Time per Loan" in seconds
 * - 2.4: Display "Time Saved" percentage vs manual
 */
export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      data-testid="metrics-cards"
    >
      {/* Requirement 2.1: Today's Assessments count */}
      <MetricCard
        title="Today's Assessments"
        value={metrics.todayAssessments}
        icon="📊"
      />
      
      {/* Requirement 2.2: Approval Rate percentage */}
      <MetricCard
        title="Approval Rate"
        value={metrics.approvalRate}
        suffix="%"
        decimals={1}
        icon="✅"
      />
      
      {/* Requirement 2.3: Average Time per Loan in seconds */}
      <MetricCard
        title="Average Time per Loan"
        value={metrics.averageTimeSeconds}
        suffix="s"
        decimals={1}
        icon="⏱️"
      />
      
      {/* Requirement 2.4: Time Saved percentage vs manual */}
      <MetricCard
        title="Time Saved"
        value={metrics.timeSavedPercent}
        suffix="%"
        decimals={1}
        icon="🚀"
      />
    </div>
  );
};

export default MetricsCards;
