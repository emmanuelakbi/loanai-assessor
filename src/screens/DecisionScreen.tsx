import React from 'react';
import { DecisionBanner } from '../components/DecisionBanner';
import { LoanTermsCard } from '../components/LoanTermsCard';
import { PDFPreview, PDFDownloadButton } from '../components/PDFPreview';
import { AuditTrail } from '../components/AuditTrail';
import type { Assessment, LoanDecision } from '../types';

export interface DecisionScreenProps {
  assessment: Assessment;
  onNewAssessment?: () => void;
}

/**
 * DecisionScreen Component
 * Integrates all decision engine components to display the final loan decision.
 * 
 * Architecture:
 * DecisionScreen
 * ├── DecisionBanner
 * ├── ContentRow
 * │   ├── LoanTermsCard (if approved)
 * │   └── PDFPreview
 * ├── AuditTrail
 * ├── ActionButtons
 * └── ProcessingComparison
 * 
 * Requirements: 1.1, 3.1, 4.1, 5.1-5.3
 */
export const DecisionScreen: React.FC<DecisionScreenProps> = ({ assessment, onNewAssessment }) => {
  const {
    borrower,
    creditScore,
    compositeScore,
    loanTerms,
    auditTrail,
  } = assessment;

  const decision: LoanDecision = compositeScore.decision;
  const isApproved = decision === 'APPROVED';

  // Calculate AI processing time from audit trail (in seconds)
  const calculateAIProcessingTime = (): number => {
    if (auditTrail.length < 2) {
      return compositeScore.processingTimeMs / 1000;
    }
    const firstEntry = auditTrail[0];
    const lastEntry = auditTrail[auditTrail.length - 1];
    const timeDiffMs = new Date(lastEntry.timestamp).getTime() - new Date(firstEntry.timestamp).getTime();
    return Math.max(timeDiffMs / 1000, compositeScore.processingTimeMs / 1000);
  };

  const aiProcessingTimeSeconds = calculateAIProcessingTime();
  const manualProcessingTimeMinutes = 30; // Estimated manual processing time
  const timeSavingsMinutes = manualProcessingTimeMinutes - (aiProcessingTimeSeconds / 60);
  const timeSavingsPercent = Math.round((timeSavingsMinutes / manualProcessingTimeMinutes) * 100);

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '32px',
    minHeight: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1E3A8A',
    marginBottom: '8px',
  };

  // Content row for LoanTermsCard and PDFPreview side by side
  const contentRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isApproved ? '1fr 1fr' : '1fr',
    gap: '24px',
  };

  // Action buttons row style
  const actionRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
  };

  // Primary button style (Export PDF)
  const primaryButtonStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 24px',
    backgroundColor: '#10B981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    transition: 'background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
  };

  // Secondary button style (New Assessment)
  const secondaryButtonStyle: React.CSSProperties = {
    height: '48px',
    padding: '0 24px',
    backgroundColor: '#1E3A8A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
  };

  // Processing comparison styles
  const comparisonContainerStyle: React.CSSProperties = {
    backgroundColor: '#F0FDF4',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #BBF7D0',
  };

  const comparisonTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#166534',
    marginBottom: '16px',
  };

  const comparisonRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '24px',
  };

  const comparisonItemStyle: React.CSSProperties = {
    textAlign: 'center',
  };

  const comparisonLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const comparisonValueStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
  };

  const comparisonHighlightStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 700,
    color: '#10B981',
  };

  return (
    <div style={containerStyle} data-testid="decision-screen">
      <h1 style={headerStyle}>Loan Decision</h1>

      {/* Decision Banner - Full width (Requirement 1.1) */}
      <DecisionBanner
        decision={decision}
        borrowerName={borrower.fullName}
        score={compositeScore.total}
        industry={borrower.industrySector}
      />

      {/* Content Row: LoanTermsCard (if approved) and PDFPreview (Requirements 2.1, 3.1) */}
      <div style={contentRowStyle}>
        {/* LoanTermsCard - Only show if decision is APPROVED */}
        {isApproved && loanTerms && (
          <LoanTermsCard loanTerms={loanTerms} />
        )}

        {/* PDFPreview - Show for approved loans with loan terms (Requirement 3.1) */}
        {isApproved && loanTerms && (
          <PDFPreview
            borrower={borrower}
            loanTerms={loanTerms}
            creditScore={creditScore}
            date={new Date()}
          />
        )}
      </div>

      {/* Audit Trail (Requirement 4.1) */}
      <AuditTrail entries={auditTrail} />

      {/* ActionButtons - Export PDF & New Assessment (Requirement 5.1, 5.2) */}
      <div style={actionRowStyle} data-testid="action-buttons">
        {/* Export PDF button - only show for approved loans with loan terms */}
        {isApproved && loanTerms && (
          <PDFDownloadButton
            borrower={borrower}
            loanTerms={loanTerms}
            creditScore={creditScore}
            date={new Date()}
            className="pdf-download-btn"
          >
            <span style={primaryButtonStyle}>Export PDF</span>
          </PDFDownloadButton>
        )}
        
        {/* New Assessment button */}
        <button
          style={secondaryButtonStyle}
          onClick={onNewAssessment}
          data-testid="new-assessment-button"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-lg"
        >
          New Assessment
        </button>
      </div>

      {/* ProcessingComparison - AI vs Manual processing time (Requirement 5.3) */}
      <div style={comparisonContainerStyle} data-testid="processing-comparison">
        <div style={comparisonTitleStyle}>Processing Time Comparison</div>
        <div style={comparisonRowStyle}>
          <div style={comparisonItemStyle}>
            <div style={comparisonLabelStyle}>AI Processing</div>
            <div style={comparisonValueStyle}>
              {aiProcessingTimeSeconds < 60
                ? `${aiProcessingTimeSeconds.toFixed(1)}s`
                : `${(aiProcessingTimeSeconds / 60).toFixed(1)}m`}
            </div>
          </div>
          <div style={comparisonItemStyle}>
            <div style={comparisonLabelStyle}>Manual Processing</div>
            <div style={comparisonValueStyle}>~{manualProcessingTimeMinutes}m</div>
          </div>
          <div style={comparisonItemStyle}>
            <div style={comparisonLabelStyle}>Time Saved</div>
            <div style={comparisonHighlightStyle}>{timeSavingsPercent}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionScreen;
