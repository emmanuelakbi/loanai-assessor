import React from 'react';

export interface EfficiencyMetricsProps {
  /** Total number of processed applications */
  totalProcessed: number;
  /** Actual AI processing time in milliseconds */
  totalTimeMs: number;
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
 * @returns Time in milliseconds
 */
export const calculateManualTimeMs = (count: number): number => {
  const MINUTES_PER_APPLICATION = 5;
  const MS_PER_MINUTE = 60 * 1000;
  return count * MINUTES_PER_APPLICATION * MS_PER_MINUTE;
};

/**
 * Calculates percentage savings between manual and AI processing
 * @param manualTimeMs Manual processing time in milliseconds
 * @param aiTimeMs AI processing time in milliseconds
 * @returns Percentage savings (0-100)
 */
export const calculatePercentageSavings = (manualTimeMs: number, aiTimeMs: number): number => {
  if (manualTimeMs <= 0) {
    return 0;
  }
  const savings = ((manualTimeMs - aiTimeMs) / manualTimeMs) * 100;
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, savings));
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  colorClass: string;
  testId: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, colorClass, testId }) => (
  <div
    className={`rounded-xl p-6 flex flex-col items-center justify-center min-w-[180px] ${colorClass}`}
    data-testid={testId}
  >
    <span className="text-sm font-medium text-gray-600 mb-2">{title}</span>
    <span className="text-2xl font-bold" data-testid={`${testId}-value`}>
      {value}
    </span>
    {subtitle && (
      <span className="text-xs text-gray-500 mt-1" data-testid={`${testId}-subtitle`}>
        {subtitle}
      </span>
    )}
  </div>
);

/**
 * EfficiencyMetrics - Displays efficiency comparison between manual and AI processing
 *
 * Requirements:
 * - 5.1: Display manual time (5min × count)
 * - 5.2: Display AI time (actual)
 * - 5.3: Display percentage savings
 */
export const EfficiencyMetrics: React.FC<EfficiencyMetricsProps> = ({
  totalProcessed,
  totalTimeMs,
}) => {
  // Requirement 5.1: Calculate manual time (5 minutes per application)
  const manualTimeMs = calculateManualTimeMs(totalProcessed);

  // Requirement 5.3: Calculate percentage savings
  const percentageSavings = calculatePercentageSavings(manualTimeMs, totalTimeMs);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="efficiency-metrics">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Efficiency Comparison</h3>
      <div className="flex flex-wrap gap-4">
        {/* Requirement 5.1: Manual time (5min × count) */}
        <MetricCard
          title="Manual Processing"
          value={formatTime(manualTimeMs)}
          subtitle={`5 min × ${totalProcessed} applications`}
          colorClass="bg-gray-100"
          testId="efficiency-manual-time"
        />

        {/* Requirement 5.2: AI time (actual) */}
        <MetricCard
          title="AI Processing"
          value={formatTime(totalTimeMs)}
          subtitle="Actual time"
          colorClass="bg-blue-100"
          testId="efficiency-ai-time"
        />

        {/* Requirement 5.3: Percentage savings */}
        <MetricCard
          title="Time Saved"
          value={`${percentageSavings.toFixed(1)}%`}
          subtitle="Efficiency gain"
          colorClass="bg-green-100"
          testId="efficiency-savings"
        />
      </div>
    </div>
  );
};

export default EfficiencyMetrics;
