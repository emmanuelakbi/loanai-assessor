import React, { useEffect, useState, useRef } from 'react';

export interface ScoreBreakdownProps {
  creditComponent: number;    // 0-400 (weighted)
  incomeComponent: number;    // 0-300 (weighted)
  esgComponent: number;       // 0-300 (weighted)
  creditRawScore?: number;    // 300-850 (raw credit score)
  incomeRawScore?: number;    // 0-100 (raw income/assets score)
  esgRawScore?: number;       // 0-100 (raw ESG score)
  animationDuration?: number; // milliseconds, default 1000
}

interface ScoreBarConfig {
  label: string;
  rawScore: number;
  rawMax: number;
  rawMin: number;
  weightedScore: number;
  maxWeighted: number;
  weight: string;
  dataSource: string;
  color: string;
}

/**
 * Easing function for smooth animation (ease-out cubic)
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calculate raw credit score from weighted component
 * Reverse of: ((score - 300) / 550) * 400 = weighted
 * So: score = (weighted / 400) * 550 + 300
 */
function calculateRawCreditScore(weightedScore: number): number {
  return Math.round((weightedScore / 400) * 550 + 300);
}

/**
 * Calculate raw score from weighted component (for income/ESG)
 * Reverse of: (score / 100) * maxWeighted = weighted
 * So: score = (weighted / maxWeighted) * 100
 */
function calculateRawScore(weightedScore: number, maxWeighted: number): number {
  return Math.round((weightedScore / maxWeighted) * 100);
}

/**
 * Individual progress bar component for a score category
 */
const ScoreBar: React.FC<{
  config: ScoreBarConfig;
  animatedPercentage: number;
}> = ({ config, animatedPercentage }) => {
  const { label, rawScore, rawMax, rawMin, weightedScore, maxWeighted, weight, dataSource, color } = config;
  
  return (
    <div className="mb-4" data-testid={`score-bar-${label.toLowerCase().replace(/\//g, '-')}`}>
      {/* Header row with label and scores */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800" data-testid={`${label.toLowerCase().replace(/\//g, '-')}-label`}>
            {label}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {weight}
          </span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-900" data-testid={`${label.toLowerCase().replace(/\//g, '-')}-weighted`}>
            {weightedScore}
          </span>
          <span className="text-gray-500 text-sm"> / {maxWeighted}</span>
        </div>
      </div>
      
      {/* Raw score display */}
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-gray-500" data-testid={`${label.toLowerCase().replace(/\//g, '-')}-raw`}>
          Raw: {rawScore} ({rawMin}-{rawMax})
        </span>
        <span className="text-gray-400 text-xs italic" data-testid={`${label.toLowerCase().replace(/\//g, '-')}-source`}>
          Source: {dataSource}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${animatedPercentage}%`,
            backgroundColor: color,
          }}
          data-testid={`${label.toLowerCase().replace(/\//g, '-')}-progress`}
        />
      </div>
    </div>
  );
};

/**
 * ScoreBreakdown - Displays three progress bars showing score components
 * 
 * Requirements:
 * - 3.1: Display three progress bars: Credit, Income/Assets, ESG
 * - 3.2: Show raw score and weighted contribution for each component
 * - 3.3: Animate progress bars from 0 to final width over 1 second
 * - 3.4: Display data source attribution for each component
 */
export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  creditComponent,
  incomeComponent,
  esgComponent,
  creditRawScore,
  incomeRawScore,
  esgRawScore,
  animationDuration = 1000,
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clamp weighted scores to valid ranges
  const clampedCredit = Math.max(0, Math.min(400, creditComponent));
  const clampedIncome = Math.max(0, Math.min(300, incomeComponent));
  const clampedESG = Math.max(0, Math.min(300, esgComponent));

  // Calculate raw scores if not provided
  const rawCredit = creditRawScore ?? calculateRawCreditScore(clampedCredit);
  const rawIncome = incomeRawScore ?? calculateRawScore(clampedIncome, 300);
  const rawESG = esgRawScore ?? calculateRawScore(clampedESG, 300);

  // Score bar configurations
  const scoreConfigs: ScoreBarConfig[] = [
    {
      label: 'Credit',
      rawScore: rawCredit,
      rawMax: 850,
      rawMin: 300,
      weightedScore: clampedCredit,
      maxWeighted: 400,
      weight: '40%',
      dataSource: 'MockCreditBureau',
      color: '#3B82F6', // blue
    },
    {
      label: 'Income/Assets',
      rawScore: rawIncome,
      rawMax: 100,
      rawMin: 0,
      weightedScore: clampedIncome,
      maxWeighted: 300,
      weight: '30%',
      dataSource: 'Internal Calculation',
      color: '#10B981', // green
    },
    {
      label: 'ESG',
      rawScore: rawESG,
      rawMax: 100,
      rawMin: 0,
      weightedScore: clampedESG,
      maxWeighted: 300,
      weight: '30%',
      dataSource: 'MockESGProvider',
      color: '#8B5CF6', // purple
    },
  ];

  // Animation effect - animate from 0 to 100% over 1 second
  useEffect(() => {
    // Reset animation
    setAnimationProgress(0);
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
      
      setAnimationProgress(easedProgress);
      
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
  }, [clampedCredit, clampedIncome, clampedESG, animationDuration]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm" data-testid="score-breakdown">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
      
      {scoreConfigs.map((config) => {
        // Calculate animated percentage for this bar
        const targetPercentage = (config.weightedScore / config.maxWeighted) * 100;
        const animatedPercentage = targetPercentage * animationProgress;
        
        return (
          <ScoreBar
            key={config.label}
            config={config}
            animatedPercentage={animatedPercentage}
          />
        );
      })}
      
      {/* Total summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">Total Composite Score</span>
          <span className="font-bold text-xl text-gray-900" data-testid="total-score">
            {clampedCredit + clampedIncome + clampedESG}
            <span className="text-gray-500 text-sm font-normal"> / 1000</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBreakdown;
