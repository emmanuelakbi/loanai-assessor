import React from 'react';
import type { LoanDecision } from '../../types';

export interface DecisionIndicatorProps {
  /** Direct decision value - takes precedence over score */
  decision?: LoanDecision;
  /** Score to calculate decision from (0-1000) - used if decision not provided */
  score?: number;
}

// Decision color mapping per requirements 4.1-4.3
const DECISION_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#10B981', // green (>750)
  REVIEW: '#F59E0B',   // yellow (600-750)
  REJECTED: '#EF4444', // red (<600)
};

// Decision emoji indicators per requirements
const DECISION_EMOJI: Record<LoanDecision, string> = {
  APPROVED: '🟢',
  REVIEW: '🟡',
  REJECTED: '🔴',
};

// Decision display text
const DECISION_TEXT: Record<LoanDecision, string> = {
  APPROVED: 'APPROVED',
  REVIEW: 'REVIEW',
  REJECTED: 'REJECTED',
};

/**
 * Determines the decision based on score thresholds
 * Requirements 4.1-4.3:
 * - >750 = APPROVED
 * - 600-750 = REVIEW
 * - <600 = REJECTED
 */
export function getDecisionFromScore(score: number): LoanDecision {
  if (score > 750) return 'APPROVED';
  if (score >= 600) return 'REVIEW';
  return 'REJECTED';
}

/**
 * DecisionIndicator - Displays decision classification with visual indicators
 * 
 * Requirements:
 * - 4.1: Score > 750 → APPROVED (🟢)
 * - 4.2: Score 600-750 → REVIEW (🟡)
 * - 4.3: Score < 600 → REJECTED (🔴)
 */
export const DecisionIndicator: React.FC<DecisionIndicatorProps> = ({
  decision,
  score,
}) => {
  // Determine the effective decision
  // If decision prop is provided, use it; otherwise calculate from score
  let effectiveDecision: LoanDecision;
  
  if (decision) {
    effectiveDecision = decision;
  } else if (score !== undefined) {
    effectiveDecision = getDecisionFromScore(score);
  } else {
    // Default to REVIEW if neither is provided
    effectiveDecision = 'REVIEW';
  }

  const color = DECISION_COLORS[effectiveDecision];
  const emoji = DECISION_EMOJI[effectiveDecision];
  const text = DECISION_TEXT[effectiveDecision];

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: `${color}15`, // 15% opacity background
    border: `2px solid ${color}`,
  };

  const emojiStyle: React.CSSProperties = {
    fontSize: '20px',
    lineHeight: 1,
  };

  const textStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    color: color,
    letterSpacing: '0.5px',
  };

  return (
    <div style={containerStyle} data-testid="decision-indicator">
      <span style={emojiStyle} data-testid="decision-emoji" role="img" aria-label={effectiveDecision}>
        {emoji}
      </span>
      <span style={textStyle} data-testid="decision-text">
        {text}
      </span>
    </div>
  );
};

export default DecisionIndicator;
