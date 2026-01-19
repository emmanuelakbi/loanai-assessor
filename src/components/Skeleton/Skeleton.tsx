import React from 'react';

export interface SkeletonProps {
  /** Width of the skeleton (CSS value) */
  width?: string | number;
  /** Height of the skeleton (CSS value) */
  height?: string | number;
  /** Border radius (CSS value) */
  borderRadius?: string | number;
  /** Additional CSS class names */
  className?: string;
  /** Variant type for common skeleton shapes */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

/**
 * Skeleton - Loading placeholder component with pulse animation
 * 
 * Requirements:
 * - 8.6: THE LoanAI_System SHALL display loading states with skeleton screens
 *        or spinners for all async operations
 * 
 * Usage:
 * - <Skeleton width={200} height={20} /> - Custom dimensions
 * - <Skeleton variant="circular" width={48} height={48} /> - Avatar placeholder
 * - <Skeleton variant="text" /> - Text line placeholder
 * - <Skeleton variant="rectangular" height={200} /> - Card/image placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rectangular',
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'text':
        return {
          width: width ?? '100%',
          height: height ?? '1em',
          borderRadius: borderRadius ?? '4px',
        };
      case 'circular':
        return {
          width: width ?? 40,
          height: height ?? 40,
          borderRadius: '50%',
        };
      case 'rounded':
        return {
          width: width ?? '100%',
          height: height ?? 40,
          borderRadius: borderRadius ?? '8px',
        };
      case 'rectangular':
      default:
        return {
          width: width ?? '100%',
          height: height ?? 40,
          borderRadius: borderRadius ?? '4px',
        };
    }
  };

  const baseStyles: React.CSSProperties = {
    backgroundColor: '#E5E7EB',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    ...getVariantStyles(),
  };

  return (
    <>
      <style>
        {`
          @keyframes skeleton-pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        style={baseStyles}
        className={className}
        data-testid="skeleton"
        role="status"
        aria-label="Loading..."
      />
    </>
  );
};

export default Skeleton;
