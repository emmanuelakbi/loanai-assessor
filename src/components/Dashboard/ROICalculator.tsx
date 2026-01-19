import React from 'react';

export interface ROICalculatorProps {
  /** Number of loans processed per day (default: 100) */
  loansPerDay?: number;
  /** Manual processing time per loan in minutes (default: 5) */
  manualTimeMinutes?: number;
  /** AI processing time per loan in seconds (default: 30) */
  aiTimeSeconds?: number;
  /** Annual cost savings in millions (default: 2) */
  costSavingsMillions?: number;
  /** Number of loan officers for cost calculation (default: 100) */
  loanOfficerCount?: number;
  /** Total loan market size in trillions (default: 5) */
  marketSizeTrillions?: number;
  /** Market capture percentage (default: 1) */
  marketCapturePercent?: number;
}

/**
 * ROICalculator - Component displaying ROI metrics including time savings,
 * cost savings, and market opportunity calculations.
 * 
 * Design Specifications:
 * - Fintech color scheme: #1E3A8A primary blue, #F8FAFC background white
 * - White card with shadow, consistent with other Dashboard components
 * - Clear visual hierarchy with sections for each metric
 * 
 * Requirements:
 * - 6.1: THE Dashboard SHALL display time savings metric: 
 *        "Manual: 5min/loan × 100 loans/day = 500min vs AI: 30s/loan = 50min"
 * - 6.2: THE Dashboard SHALL display cost savings metric: 
 *        "70% time savings = $2M/year per 100 loan officers"
 * - 6.3: THE Dashboard SHALL display market opportunity metric: 
 *        "$5T loan market → 1% capture = $50B opportunity"
 */
export const ROICalculator: React.FC<ROICalculatorProps> = ({
  loansPerDay = 100,
  manualTimeMinutes = 5,
  aiTimeSeconds = 30,
  costSavingsMillions = 2,
  loanOfficerCount = 100,
  marketSizeTrillions = 5,
  marketCapturePercent = 1,
}) => {
  // Calculate time savings (Requirement 6.1)
  const manualTotalMinutes = manualTimeMinutes * loansPerDay;
  const aiTotalMinutes = (aiTimeSeconds * loansPerDay) / 60;
  const timeSavingsPercent = Math.round(
    ((manualTotalMinutes - aiTotalMinutes) / manualTotalMinutes) * 100
  );

  // Calculate market opportunity (Requirement 6.3)
  const marketOpportunityBillions = marketSizeTrillions * 1000 * (marketCapturePercent / 100);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      data-testid="roi-calculator"
      role="region"
      aria-label="ROI Calculator"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1E3A8A]">
          ROI Calculator
        </h2>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Time Savings Section (Requirement 6.1) */}
        <div 
          className="space-y-2"
          data-testid="time-savings-section"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">⏱️</span>
            <span className="text-sm font-medium text-gray-700">Time Savings</span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {/* Manual Processing */}
            <div 
              className="flex items-center justify-between text-sm"
              data-testid="manual-time"
            >
              <span className="text-gray-600">
                Manual: {manualTimeMinutes}min × {loansPerDay} loans
              </span>
              <span className="font-semibold text-gray-800">
                = {manualTotalMinutes}min/day
              </span>
            </div>
            
            {/* AI Processing */}
            <div 
              className="flex items-center justify-between text-sm"
              data-testid="ai-time"
            >
              <span className="text-gray-600">
                AI: {aiTimeSeconds}s × {loansPerDay} loans
              </span>
              <span className="font-semibold text-[#10B981]">
                = {aiTotalMinutes}min/day
              </span>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-2" />
            
            {/* Time Savings Summary */}
            <div 
              className="flex items-center justify-between text-sm"
              data-testid="time-savings-summary"
            >
              <span className="text-gray-600">Time Reduction</span>
              <span className="font-bold text-[#10B981]">
                {timeSavingsPercent}% faster
              </span>
            </div>
          </div>
        </div>

        {/* Cost Savings Section (Requirement 6.2) */}
        <div 
          className="space-y-2"
          data-testid="cost-savings-section"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">💰</span>
            <span className="text-sm font-medium text-gray-700">Cost Savings</span>
          </div>
          
          <div 
            className="bg-[#10B981]/10 rounded-lg p-4"
            data-testid="cost-savings-display"
          >
            <div className="text-center">
              <span className="text-2xl font-bold text-[#10B981]">
                ${costSavingsMillions}M
              </span>
              <span className="text-sm text-gray-600">/year</span>
            </div>
            <p className="text-xs text-center text-gray-500 mt-1">
              per {loanOfficerCount} loan officers
            </p>
          </div>
        </div>

        {/* Market Opportunity Section (Requirement 6.3) */}
        <div 
          className="space-y-2"
          data-testid="market-opportunity-section"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🎯</span>
            <span className="text-sm font-medium text-gray-700">Market Opportunity</span>
          </div>
          
          <div 
            className="bg-[#1E3A8A]/10 rounded-lg p-4"
            data-testid="market-opportunity-display"
          >
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-semibold text-[#1E3A8A]">
                ${marketSizeTrillions}T
              </span>
              <span className="text-gray-500">loan market</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500">{marketCapturePercent}% capture</span>
              <span className="text-gray-400">=</span>
              <span className="font-bold text-[#1E3A8A]">
                ${marketOpportunityBillions}B
              </span>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              opportunity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;
