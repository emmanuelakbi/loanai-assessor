import React from 'react';
import { MetricCard } from '../MetricCard';
import { MetricCardSkeleton } from '../Skeleton';

export interface DashboardMetrics {
  todayAssessments: number;
  approvalRate: number;
  averageTimeSeconds: number;
  timeSavedPercent: number;
}

export interface MetricsCardsProps {
  /** Dashboard metrics to display */
  metrics: DashboardMetrics;
  /** Animation duration in milliseconds (default: 1000) */
  animationDuration?: number;
  /** Whether data is loading */
  isLoading?: boolean;
}

/**
 * MetricsCards - Container component that displays all four dashboard metric cards
 * with animated counters for values.
 * 
 * Design Specifications:
 * - Cards: 280px × 120px each, white with shadow
 * - Fintech color scheme: #1E3A8A primary blue, #F8FAFC background white
 * 
 * Requirements:
 * - 1.4: THE Dashboard SHALL display key metrics: total assessments today, 
 *        approval rate, average processing time
 * - 6.5: THE LoanAI_System SHALL include animated counters for key metrics 
 *        on the Dashboard
 * 
 * Four Metric Cards:
 * 1. Today's Assessments - Count of assessments processed today
 * 2. Approval Rate - Percentage of approved loans
 * 3. Avg Time - Average processing time per loan in seconds
 * 4. Time Saved - Percentage of time saved vs manual processing
 */
export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  metrics,
  animationDuration = 1000,
  isLoading = false,
}) => {
  // Show skeleton cards when loading (Requirement 8.6)
  if (isLoading) {
    return (
      <div
        className="flex flex-wrap gap-4"
        data-testid="metrics-cards-loading"
        role="region"
        aria-label="Loading Dashboard Metrics"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[280px] h-[120px]">
            <MetricCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex flex-wrap gap-4"
      data-testid="metrics-cards"
      role="region"
      aria-label="Dashboard Metrics"
    >
      {/* Card 1: Today's Assessments (Requirement 1.4) */}
      <div 
        className="w-[280px] h-[120px]"
        data-testid="metric-card-container-assessments"
      >
        <MetricCard
          title="Today's Assessments"
          value={metrics.todayAssessments}
          icon="📊"
          animationDuration={animationDuration}
        />
      </div>
      
      {/* Card 2: Approval Rate (Requirement 1.4) */}
      <div 
        className="w-[280px] h-[120px]"
        data-testid="metric-card-container-approval"
      >
        <MetricCard
          title="Approval Rate"
          value={metrics.approvalRate}
          suffix="%"
          decimals={1}
          icon="✅"
          animationDuration={animationDuration}
        />
      </div>
      
      {/* Card 3: Average Time per Loan (Requirement 1.4) */}
      <div 
        className="w-[280px] h-[120px]"
        data-testid="metric-card-container-time"
      >
        <MetricCard
          title="Avg Time"
          value={metrics.averageTimeSeconds}
          suffix="s"
          decimals={1}
          icon="⏱️"
          animationDuration={animationDuration}
        />
      </div>
      
      {/* Card 4: Time Saved vs Manual (Requirement 6.5) */}
      <div 
        className="w-[280px] h-[120px]"
        data-testid="metric-card-container-saved"
      >
        <MetricCard
          title="Time Saved"
          value={metrics.timeSavedPercent}
          suffix="%"
          decimals={1}
          icon="🚀"
          animationDuration={animationDuration}
        />
      </div>
    </div>
  );
};

export default MetricsCards;
