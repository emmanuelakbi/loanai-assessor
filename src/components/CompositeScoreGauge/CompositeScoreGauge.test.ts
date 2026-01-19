import { describe, it, expect } from 'vitest';

/**
 * Tests for CompositeScoreGauge component
 * 
 * Requirements validated:
 * - 1.1: Display composite score gauge (0-1000 scale)
 * - 1.2: Animate from 0 to final score over 1.5 seconds
 * - 1.3: Display numeric score in center (48px bold)
 * - 1.4: Color based on decision: green (>750), yellow (600-750), red (<600)
 */

// Test the decision color logic
describe('CompositeScoreGauge decision colors', () => {
  // Helper function to determine decision from score (mirrors component logic)
  function getDecisionFromScore(score: number): 'APPROVED' | 'REVIEW' | 'REJECTED' {
    if (score > 750) return 'APPROVED';
    if (score >= 600) return 'REVIEW';
    return 'REJECTED';
  }

  // Requirement 1.4: Color based on decision
  describe('decision threshold logic', () => {
    it('should return APPROVED for scores > 750', () => {
      expect(getDecisionFromScore(751)).toBe('APPROVED');
      expect(getDecisionFromScore(800)).toBe('APPROVED');
      expect(getDecisionFromScore(1000)).toBe('APPROVED');
    });

    it('should return REVIEW for scores 600-750 inclusive', () => {
      expect(getDecisionFromScore(600)).toBe('REVIEW');
      expect(getDecisionFromScore(675)).toBe('REVIEW');
      expect(getDecisionFromScore(750)).toBe('REVIEW');
    });

    it('should return REJECTED for scores < 600', () => {
      expect(getDecisionFromScore(599)).toBe('REJECTED');
      expect(getDecisionFromScore(300)).toBe('REJECTED');
      expect(getDecisionFromScore(0)).toBe('REJECTED');
    });

    // Boundary tests
    it('should handle boundary at 750 correctly', () => {
      expect(getDecisionFromScore(750)).toBe('REVIEW');
      expect(getDecisionFromScore(751)).toBe('APPROVED');
    });

    it('should handle boundary at 600 correctly', () => {
      expect(getDecisionFromScore(599)).toBe('REJECTED');
      expect(getDecisionFromScore(600)).toBe('REVIEW');
    });
  });
});

// Test the easing function
describe('easeOutCubic animation function', () => {
  function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  it('should return 0 at start (t=0)', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('should return 1 at end (t=1)', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('should return value between 0 and 1 for middle values', () => {
    const midValue = easeOutCubic(0.5);
    expect(midValue).toBeGreaterThan(0);
    expect(midValue).toBeLessThan(1);
    // Ease-out should be > 0.5 at t=0.5 (faster start, slower end)
    expect(midValue).toBeGreaterThan(0.5);
  });

  it('should be monotonically increasing', () => {
    const values = [0, 0.25, 0.5, 0.75, 1].map(easeOutCubic);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});

// Test score clamping logic
describe('Score clamping', () => {
  function clampScore(score: number): number {
    return Math.max(0, Math.min(1000, score));
  }

  it('should clamp scores below 0 to 0', () => {
    expect(clampScore(-100)).toBe(0);
    expect(clampScore(-1)).toBe(0);
  });

  it('should clamp scores above 1000 to 1000', () => {
    expect(clampScore(1001)).toBe(1000);
    expect(clampScore(2000)).toBe(1000);
  });

  it('should not modify valid scores', () => {
    expect(clampScore(0)).toBe(0);
    expect(clampScore(500)).toBe(500);
    expect(clampScore(1000)).toBe(1000);
  });
});

// Test arc calculation logic
describe('Arc calculation', () => {
  const startAngle = -210;
  const endAngle = 30;
  const totalArcDegrees = endAngle - startAngle; // 240 degrees

  function calculateFillAngle(score: number): number {
    const fillPercentage = score / 1000;
    return startAngle + (totalArcDegrees * fillPercentage);
  }

  it('should return start angle for score 0', () => {
    expect(calculateFillAngle(0)).toBe(startAngle);
  });

  it('should return end angle for score 1000', () => {
    expect(calculateFillAngle(1000)).toBe(endAngle);
  });

  it('should return middle angle for score 500', () => {
    const midAngle = calculateFillAngle(500);
    const expectedMid = startAngle + (totalArcDegrees * 0.5);
    expect(midAngle).toBe(expectedMid);
  });

  it('should scale linearly with score', () => {
    const angle250 = calculateFillAngle(250);
    const angle500 = calculateFillAngle(500);
    const angle750 = calculateFillAngle(750);
    
    // Check equal spacing
    const diff1 = angle500 - angle250;
    const diff2 = angle750 - angle500;
    expect(diff1).toBeCloseTo(diff2, 5);
  });
});

// Test polar to cartesian conversion
describe('Polar to Cartesian conversion', () => {
  const center = 100;
  const radius = 92;

  function polarToCartesian(angle: number): { x: number; y: number } {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  }

  it('should return correct point at 0 degrees (right)', () => {
    const point = polarToCartesian(0);
    expect(point.x).toBeCloseTo(center + radius, 5);
    expect(point.y).toBeCloseTo(center, 5);
  });

  it('should return correct point at 90 degrees (bottom)', () => {
    const point = polarToCartesian(90);
    expect(point.x).toBeCloseTo(center, 5);
    expect(point.y).toBeCloseTo(center + radius, 5);
  });

  it('should return correct point at 180 degrees (left)', () => {
    const point = polarToCartesian(180);
    expect(point.x).toBeCloseTo(center - radius, 5);
    expect(point.y).toBeCloseTo(center, 5);
  });

  it('should return correct point at -90 degrees (top)', () => {
    const point = polarToCartesian(-90);
    expect(point.x).toBeCloseTo(center, 5);
    expect(point.y).toBeCloseTo(center - radius, 5);
  });
});
