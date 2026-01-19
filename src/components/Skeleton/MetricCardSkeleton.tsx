import React from 'react';
import { Skeleton } from './Skeleton';

/**
 * MetricCardSkeleton - Loading placeholder for MetricCard component
 * 
 * Requirements:
 * - 8.6: Display loading states with skeleton screens for async operations
 * 
 * Matches the layout of MetricCard:
 * - Icon + Title row
 * - Large value display
 */
export const MetricCardSkeleton: React.FC = () => {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 min-w-[200px]"
      data-testid="metric-card-skeleton"
    >
      {/* Icon + Title row */}
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={120} height={16} />
      </div>
      {/* Value */}
      <Skeleton variant="text" width={80} height={36} />
    </div>
  );
};

export default MetricCardSkeleton;
