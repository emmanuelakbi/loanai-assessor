import React from 'react';
import type { LoanTerms } from '../../types';

export interface LoanTermsCardProps {
  loanTerms: LoanTerms;
}

/**
 * Format a number as currency (USD)
 * e.g., 100000 -> "$100,000"
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 * e.g., 5.5 -> "5.5%"
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format term months as years and months
 * e.g., 360 -> "30 years"
 */
function formatTermLength(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }
  
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * LoanTermsCard Component
 * Displays generated loan terms for approved applications
 * Requirements: 2.1, 2.2
 */
export const LoanTermsCard: React.FC<LoanTermsCardProps> = ({ loanTerms }) => {
  const {
    principalAmount,
    interestRate,
    termMonths,
    monthlyPayment,
    totalInterest,
    generatedAt,
  } = loanTerms;

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E7EB',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  };

  const termItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#111827',
  };

  const highlightValueStyle: React.CSSProperties = {
    ...valueStyle,
    color: '#10B981',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E7EB',
    fontSize: '12px',
    color: '#9CA3AF',
  };

  return (
    <div style={cardStyle} data-testid="loan-terms-card">
      <div style={headerStyle}>Loan Terms</div>
      <div style={gridStyle}>
        <div style={termItemStyle}>
          <span style={labelStyle}>Principal Amount</span>
          <span style={highlightValueStyle} data-testid="principal-amount">
            {formatCurrency(principalAmount)}
          </span>
        </div>
        <div style={termItemStyle}>
          <span style={labelStyle}>Interest Rate</span>
          <span style={valueStyle} data-testid="interest-rate">
            {formatPercentage(interestRate)}
          </span>
        </div>
        <div style={termItemStyle}>
          <span style={labelStyle}>Term Length</span>
          <span style={valueStyle} data-testid="term-length">
            {formatTermLength(termMonths)}
          </span>
        </div>
        <div style={termItemStyle}>
          <span style={labelStyle}>Monthly Payment</span>
          <span style={highlightValueStyle} data-testid="monthly-payment">
            {formatCurrency(monthlyPayment)}
          </span>
        </div>
        <div style={termItemStyle}>
          <span style={labelStyle}>Total Interest</span>
          <span style={valueStyle} data-testid="total-interest">
            {formatCurrency(totalInterest)}
          </span>
        </div>
      </div>
      <div style={footerStyle} data-testid="generated-at">
        Generated: {generatedAt.toLocaleString()}
      </div>
    </div>
  );
};

export default LoanTermsCard;
