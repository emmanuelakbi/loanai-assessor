import React, { useEffect, useState, useRef } from 'react';

export interface MetricCardProps {
  /** Title of the metric (e.g., "Today's Assessments") */
  title: string;
  /** The target value to animate to */
  value: number;
  /** Optional suffix to display after the value (e.g., "%", "s") */
  suffix?: string;
  /** Number of decimal places to display (default: 0) */
  decimals?: number;
  /** Animation duration in milliseconds (default: 1000) */
  animationDuration?: number;
  /** Optional icon or emoji to display */
  icon?: string;
}

/**
 * Easing function for smooth animation (ease-out cubic)
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * MetricCard - Displays a metric with animated count-up effect
 * 
 * Requirements:
 * - 2.1: Display "Today's Assessments" count
 * - 2.2: Display "Approval Rate" percentage
 * - 2.3: Display "Average Time per Loan" in seconds
 * - 2.4: Display "Time Saved" percentage vs manual
 * - 2.5: Animate values on load
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  suffix = '',
  decimals = 0,
  animationDuration = 1000,
  icon,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const previousValueRef = useRef<number>(0);

  useEffect(() => {
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startValue = previousValueRef.current;
    const targetValue = value;
    startTimeRef.current = null;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easedProgress = easeOutCubic(progress);
      
      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        previousValueRef.current = targetValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animationDuration]);

  const formattedValue = displayValue.toFixed(decimals);

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 min-w-[200px] transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5"
      data-testid="metric-card"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-2xl" data-testid="metric-icon" role="img" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="text-gray-500 text-sm font-medium" data-testid="metric-title">
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-3xl font-bold text-gray-900"
          data-testid="metric-value"
        >
          {formattedValue}
        </span>
        {suffix && (
          <span className="text-xl text-gray-500" data-testid="metric-suffix">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
