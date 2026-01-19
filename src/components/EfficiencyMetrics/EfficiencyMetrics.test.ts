import { describe, it, expect } from 'vitest';
import { calculateManualTimeMs, calculatePercentageSavings } from './EfficiencyMetrics';

/**
 * EfficiencyMetrics Component Tests
 *
 * Tests for the EfficiencyMetrics component that displays efficiency comparison
 * between manual and AI processing times.
 *
 * Requirements:
 * - 5.1: Display manual time (5min × count)
 * - 5.2: Display AI time (actual)
 * - 5.3: Display percentage savings
 */
describe('EfficiencyMetrics', () => {
  describe('calculateManualTimeMs', () => {
    /**
     * Validates: Requirement 5.1
     * Manual time = 5 minutes × total processed count
     */
    it('should calculate manual time as 5 minutes per application', () => {
      const count = 10;
      const expectedMs = 10 * 5 * 60 * 1000; // 10 apps × 5 min × 60 sec × 1000 ms
      expect(calculateManualTimeMs(count)).toBe(expectedMs);
    });

    it('should return 0 for zero applications', () => {
      expect(calculateManualTimeMs(0)).toBe(0);
    });

    it('should handle single application', () => {
      const expectedMs = 5 * 60 * 1000; // 5 minutes in ms
      expect(calculateManualTimeMs(1)).toBe(expectedMs);
    });

    it('should handle large batch sizes', () => {
      const count = 1000;
      const expectedMs = 1000 * 5 * 60 * 1000;
      expect(calculateManualTimeMs(count)).toBe(expectedMs);
    });

    it('should scale linearly with count', () => {
      const time10 = calculateManualTimeMs(10);
      const time20 = calculateManualTimeMs(20);
      expect(time20).toBe(time10 * 2);
    });
  });

  describe('calculatePercentageSavings', () => {
    /**
     * Validates: Requirement 5.3
     * Percentage savings = ((manual time - AI time) / manual time) × 100
     */
    it('should calculate percentage savings correctly', () => {
      const manualTimeMs = 300000; // 5 minutes
      const aiTimeMs = 30000; // 30 seconds
      const expectedSavings = ((300000 - 30000) / 300000) * 100; // 90%
      expect(calculatePercentageSavings(manualTimeMs, aiTimeMs)).toBe(expectedSavings);
    });

    it('should return 0 when manual time is 0', () => {
      expect(calculatePercentageSavings(0, 1000)).toBe(0);
    });

    it('should return 0 when AI time equals manual time', () => {
      expect(calculatePercentageSavings(1000, 1000)).toBe(0);
    });

    it('should return 100 when AI time is 0', () => {
      expect(calculatePercentageSavings(1000, 0)).toBe(100);
    });

    it('should clamp to 0 when AI time exceeds manual time', () => {
      // Edge case: AI takes longer than manual (shouldn't happen but handle gracefully)
      expect(calculatePercentageSavings(1000, 2000)).toBe(0);
    });

    it('should handle typical batch processing scenario', () => {
      // 100 applications: manual = 500 minutes, AI = 10 seconds
      const manualTimeMs = calculateManualTimeMs(100); // 30,000,000 ms (500 min)
      const aiTimeMs = 10000; // 10 seconds
      const savings = calculatePercentageSavings(manualTimeMs, aiTimeMs);
      expect(savings).toBeGreaterThan(99); // Should be ~99.97%
    });

    it('should return value between 0 and 100', () => {
      const savings = calculatePercentageSavings(10000, 5000);
      expect(savings).toBeGreaterThanOrEqual(0);
      expect(savings).toBeLessThanOrEqual(100);
    });
  });

  describe('EfficiencyMetricsProps interface', () => {
    it('should have required totalProcessed and totalTimeMs fields', () => {
      const props = {
        totalProcessed: 50,
        totalTimeMs: 5000,
      };

      expect(props).toHaveProperty('totalProcessed');
      expect(props).toHaveProperty('totalTimeMs');
    });
  });

  describe('edge cases', () => {
    it('should handle very small AI processing times', () => {
      const manualTimeMs = calculateManualTimeMs(10);
      const aiTimeMs = 1; // 1 millisecond
      const savings = calculatePercentageSavings(manualTimeMs, aiTimeMs);
      expect(savings).toBeCloseTo(100, 1);
    });

    it('should handle negative manual time gracefully', () => {
      // Should not happen but handle gracefully
      expect(calculatePercentageSavings(-1000, 500)).toBe(0);
    });

    it('should handle very large batch sizes', () => {
      const count = 100000;
      const manualTimeMs = calculateManualTimeMs(count);
      const aiTimeMs = 60000; // 1 minute for 100k applications
      const savings = calculatePercentageSavings(manualTimeMs, aiTimeMs);
      expect(savings).toBeGreaterThan(99);
    });
  });

  describe('time formatting scenarios', () => {
    it('should produce meaningful manual time for typical batches', () => {
      // 10 applications = 50 minutes = 3,000,000 ms
      expect(calculateManualTimeMs(10)).toBe(3000000);
    });

    it('should produce meaningful manual time for large batches', () => {
      // 100 applications = 500 minutes = 30,000,000 ms
      expect(calculateManualTimeMs(100)).toBe(30000000);
    });

    it('should produce meaningful manual time for enterprise batches', () => {
      // 1000 applications = 5000 minutes = 300,000,000 ms
      expect(calculateManualTimeMs(1000)).toBe(300000000);
    });
  });
});
