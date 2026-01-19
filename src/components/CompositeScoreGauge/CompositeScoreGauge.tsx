import React, { useEffect, useState, useRef } from 'react';
import type { LoanDecision } from '../../types';

export interface CompositeScoreGaugeProps {
  score: number; // 0-1000
  decision?: LoanDecision;
  animationDuration?: number; // milliseconds, default 1500
}

// Decision color mapping per requirements 1.4
const DECISION_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#10B981', // green (>750)
  REVIEW: '#F59E0B',   // yellow (600-750)
  REJECTED: '#EF4444', // red (<600)
};

/**
 * Determines the decision based on score thresholds
 * >750 = APPROVED, 600-750 = REVIEW, <600 = REJECTED
 */
function getDecisionFromScore(score: number): LoanDecision {
  if (score > 750) return 'APPROVED';
  if (score >= 600) return 'REVIEW';
  return 'REJECTED';
}

/**
 * Easing function for smooth animation (ease-out cubic)
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * CompositeScoreGauge - Animated arc gauge displaying composite score (0-1000)
 * 
 * Requirements:
 * - 1.1: Display composite score gauge (0-1000 scale)
 * - 1.2: Animate from 0 to final score over 1.5 seconds
 * - 1.3: Display numeric score in center (48px bold)
 * - 1.4: Color based on decision: green (>750), yellow (600-750), red (<600)
 */
export const CompositeScoreGauge: React.FC<CompositeScoreGaugeProps> = ({
  score,
  decision,
  animationDuration = 1500,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clamp score to valid range
  const clampedScore = Math.max(0, Math.min(1000, score));
  
  // Use provided decision or calculate from score
  const effectiveDecision = decision ?? getDecisionFromScore(clampedScore);
  const gaugeColor = DECISION_COLORS[effectiveDecision];

  // SVG arc parameters
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Arc spans 240 degrees (from -210 to 30 degrees, leaving 120 degree gap at bottom)
  const startAngle = -210;
  const endAngle = 30;
  const totalArcDegrees = endAngle - startAngle; // 240 degrees
  
  // Calculate arc path
  const polarToCartesian = (angle: number): { x: number; y: number } => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  const describeArc = (startDeg: number, endDeg: number): string => {
    const start = polarToCartesian(endDeg);
    const end = polarToCartesian(startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? 0 : 1;
    
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ');
  };

  // Background arc (full gauge track)
  const backgroundArc = describeArc(startAngle, endAngle);
  
  // Calculate the current fill angle based on animated score
  const fillPercentage = animatedScore / 1000;
  const fillAngle = startAngle + (totalArcDegrees * fillPercentage);
  const fillArc = fillPercentage > 0 ? describeArc(startAngle, fillAngle) : '';

  // Animation effect - animate from 0 to final score over 1.5 seconds
  useEffect(() => {
    // Reset animation
    setAnimatedScore(0);
    startTimeRef.current = null;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeOutCubic(progress);
      
      setAnimatedScore(Math.round(clampedScore * easedProgress));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [clampedScore, animationDuration]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Score text style - 48px bold per requirement 1.3
  const scoreTextStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: 700,
    fill: gaugeColor,
  };

  const labelTextStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    fill: '#6B7280',
  };

  return (
    <div style={containerStyle} data-testid="composite-score-gauge">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        data-testid="gauge-svg"
      >
        {/* Background track */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          data-testid="gauge-background"
        />
        
        {/* Animated fill arc */}
        {fillArc && (
          <path
            d={fillArc}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            data-testid="gauge-fill"
          />
        )}
        
        {/* Center score text - 48px bold */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          dominantBaseline="middle"
          style={scoreTextStyle}
          data-testid="score-value"
        >
          {animatedScore}
        </text>
        
        {/* Label below score */}
        <text
          x={center}
          y={center + 30}
          textAnchor="middle"
          dominantBaseline="middle"
          style={labelTextStyle}
          data-testid="score-label"
        >
          out of 1000
        </text>
      </svg>
    </div>
  );
};

export default CompositeScoreGauge;
