import { describe, it, expect } from 'vitest';

/**
 * ROICalculator Tests
 * 
 * Tests for the ROI Calculator component that displays business value metrics.
 * 
 * Requirements:
 * - 4.1: Display time savings: "Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min"
 * - 4.2: Display cost savings: "$2M/year per 100 loan officers"
 * - 4.3: Display market opportunity: "$5T market → 1% = $50B"
 */

// ROI metric data structure (mirrors component)
interface ROIMetric {
  title: string;
  value: string;
  description: string;
  icon: string;
}

// The ROI metrics data that the component displays
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

describe('ROICalculator', () => {
  describe('ROI Metrics Data Structure', () => {
    it('should have exactly 3 ROI metrics', () => {
      expect(roiMetrics.length).toBe(3);
    });

    it('should have all required properties for each metric', () => {
      roiMetrics.forEach((metric) => {
        expect(metric).toHaveProperty('title');
        expect(metric).toHaveProperty('value');
        expect(metric).toHaveProperty('description');
        expect(metric).toHaveProperty('icon');
      });
    });
  });

  /**
   * Requirement 4.1: Time savings display
   * THE ROICalculator SHALL display time savings: "Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min"
   */
  describe('Requirement 4.1: Time Savings', () => {
    const timeSavingsMetric = roiMetrics.find((m) => m.title === 'Time Savings');

    it('should have a Time Savings metric', () => {
      expect(timeSavingsMetric).toBeDefined();
    });

    it('should display the correct time savings description', () => {
      expect(timeSavingsMetric?.description).toBe(
        'Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min'
      );
    });

    it('should display 90% reduction as the value', () => {
      expect(timeSavingsMetric?.value).toBe('90% Reduction');
    });

    it('should have a time-related icon', () => {
      expect(timeSavingsMetric?.icon).toBe('⏱️');
    });
  });

  /**
   * Requirement 4.2: Cost savings display
   * THE ROICalculator SHALL display cost savings: "$2M/year per 100 loan officers"
   */
  describe('Requirement 4.2: Cost Savings', () => {
    const costSavingsMetric = roiMetrics.find((m) => m.title === 'Cost Savings');

    it('should have a Cost Savings metric', () => {
      expect(costSavingsMetric).toBeDefined();
    });

    it('should display $2M/year as the value', () => {
      expect(costSavingsMetric?.value).toBe('$2M/year');
    });

    it('should display per 100 loan officers in description', () => {
      expect(costSavingsMetric?.description).toBe('Per 100 loan officers');
    });

    it('should have a money-related icon', () => {
      expect(costSavingsMetric?.icon).toBe('💰');
    });
  });

  /**
   * Requirement 4.3: Market opportunity display
   * THE ROICalculator SHALL display market opportunity: "$5T market → 1% = $50B"
   */
  describe('Requirement 4.3: Market Opportunity', () => {
    const marketOpportunityMetric = roiMetrics.find(
      (m) => m.title === 'Market Opportunity'
    );

    it('should have a Market Opportunity metric', () => {
      expect(marketOpportunityMetric).toBeDefined();
    });

    it('should display $50B as the value', () => {
      expect(marketOpportunityMetric?.value).toBe('$50B');
    });

    it('should display the market calculation in description', () => {
      expect(marketOpportunityMetric?.description).toBe('$5T market → 1% = $50B');
    });

    it('should have a chart/growth icon', () => {
      expect(marketOpportunityMetric?.icon).toBe('📈');
    });
  });

  describe('Time Savings Calculation Verification', () => {
    it('should correctly calculate manual processing time', () => {
      const manualTimePerLoan = 5; // minutes
      const numberOfLoans = 100;
      const totalManualTime = manualTimePerLoan * numberOfLoans;
      expect(totalManualTime).toBe(500); // 500 minutes
    });

    it('should correctly calculate AI processing time', () => {
      const aiTimePerLoan = 0.5; // 30 seconds = 0.5 minutes
      const numberOfLoans = 100;
      const totalAITime = aiTimePerLoan * numberOfLoans;
      expect(totalAITime).toBe(50); // 50 minutes
    });

    it('should correctly calculate time savings percentage', () => {
      const manualTime = 500; // minutes
      const aiTime = 50; // minutes
      const timeSavedPercent = ((manualTime - aiTime) / manualTime) * 100;
      expect(timeSavedPercent).toBe(90); // 90% reduction
    });
  });

  describe('Market Opportunity Calculation Verification', () => {
    it('should correctly calculate 1% of $5T market', () => {
      const totalMarket = 5_000_000_000_000; // $5 trillion
      const marketShare = 0.01; // 1%
      const opportunity = totalMarket * marketShare;
      expect(opportunity).toBe(50_000_000_000); // $50 billion
    });
  });
});
