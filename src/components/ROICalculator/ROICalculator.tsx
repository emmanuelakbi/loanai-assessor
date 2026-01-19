import React from 'react';

/**
 * ROI metric data structure
 */
interface ROIMetric {
  title: string;
  value: string;
  description: string;
  icon: string;
}

/**
 * ROICalculator - Displays ROI metrics for business value demonstration
 * 
 * Requirements:
 * - 4.1: Display time savings: "Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min"
 * - 4.2: Display cost savings: "$2M/year per 100 loan officers"
 * - 4.3: Display market opportunity: "$5T market → 1% = $50B"
 */
export const ROICalculator: React.FC = () => {
  const roiMetrics: ROIMetric[] = [
    {
      title: 'Time Savings',
      value: '90% Reduction',
      description: 'Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min',
      icon: '⏱️',
    },
    {
      title: 'Cost Savings',
      value: '$2M/year',
      description: 'Per 100 loan officers',
      icon: '💰',
    },
    {
      title: 'Market Opportunity',
      value: '$50B',
      description: '$5T market → 1% = $50B',
      icon: '📈',
    },
  ];

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6"
      data-testid="roi-calculator"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        ROI Calculator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roiMetrics.map((metric) => (
          <div
            key={metric.title}
            className="flex flex-col gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg"
            data-testid={`roi-metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-hidden="true">
                {metric.icon}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {metric.title}
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">
              {metric.value}
            </div>
            <p className="text-sm text-gray-500" data-testid="roi-description">
              {metric.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ROICalculator;
