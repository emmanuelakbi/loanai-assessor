import React from 'react';
import type { LoanDecision, IndustrySector } from '../../types';

export interface DecisionBannerProps {
  decision: LoanDecision;
  borrowerName: string;
  score: number;
  industry: IndustrySector;
}

// Decision display text mapping
const DECISION_TEXT: Record<LoanDecision, string> = {
  APPROVED: 'LOAN APPROVED',
  REVIEW: 'MANUAL REVIEW REQUIRED',
  REJECTED: 'LOAN REJECTED',
};

// Decision color mapping per requirements
const DECISION_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#10B981', // green
  REVIEW: '#F59E0B',   // yellow
  REJECTED: '#EF4444', // red
};

// Text colors for contrast
const TEXT_COLORS: Record<LoanDecision, string> = {
  APPROVED: '#FFFFFF',
  REVIEW: '#000000',
  REJECTED: '#FFFFFF',
};

export const DecisionBanner: React.FC<DecisionBannerProps> = ({
  decision,
  borrowerName,
  score,
  industry,
}) => {
  const backgroundColor = DECISION_COLORS[decision];
  const textColor = TEXT_COLORS[decision];

  const bannerStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor,
    color: textColor,
    padding: '24px 32px',
    borderRadius: '8px',
    boxSizing: 'border-box',
  };

  const decisionTextStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '12px',
    letterSpacing: '0.5px',
  };

  const detailsContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const detailItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    opacity: 0.85,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
  };

  return (
    <div style={bannerStyle} data-testid="decision-banner">
      <div style={decisionTextStyle} data-testid="decision-text">
        {DECISION_TEXT[decision]}
      </div>
      <div style={detailsContainerStyle}>
        <div style={detailItemStyle}>
          <span style={labelStyle}>Borrower</span>
          <span style={valueStyle} data-testid="borrower-name">{borrowerName}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={labelStyle}>Score</span>
          <span style={valueStyle} data-testid="borrower-score">{score}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={labelStyle}>Industry</span>
          <span style={valueStyle} data-testid="borrower-industry">{industry}</span>
        </div>
      </div>
    </div>
  );
};

export default DecisionBanner;
