import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { fetchCreditScore } from '../services/mockCreditBureau';
import { fetchESGScore } from '../services/mockESGProvider';
import { calculateCompositeScore, calculateIncomeAssetsScore } from '../services/scoringEngine';
import { calculateLoanTerms } from '../services/loanTermsEngine';
import { CompositeScoreGauge } from '../components/CompositeScoreGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { DecisionIndicator } from '../components/DecisionIndicator';
import type { CompositeScore, CreditScore, ESGScore, IncomeAssetsScore, AuditEntry } from '../types';

type ScoringState = 'loading' | 'complete' | 'error';

interface ScoringData {
  compositeScore: CompositeScore | null;
  creditRawScore: number;
  incomeRawScore: number;
  esgRawScore: number;
}

/**
 * APIScoringScreen - Displays credit assessment results with animated visualizations
 * 
 * Requirements:
 * - 1.1: Display composite score gauge (0-1000 scale)
 * - 3.1: Display three progress bars: Credit, Income/Assets, ESG
 * - 6.1: Display results for 2 seconds after scoring completes
 * - 6.2: Automatically navigate to Decision screen after 2 seconds
 * - 6.3: Display countdown indicator during the delay
 * 
 * On mount:
 * 1. Fetches credit score from mock Credit Bureau API
 * 2. Fetches ESG score from mock ESG Provider API
 * 3. Calculates income/assets score from borrower data
 * 4. Uses scoringEngine to calculate composite score
 * 5. Updates store with scoring results
 * 6. Starts 2-second countdown, then navigates to decision screen
 */
export const APIScoringScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentAssessment, updateScoring, completeAssessment } = useAppStore();
  const [state, setState] = useState<ScoringState>('loading');
  const [scoringData, setScoringData] = useState<ScoringData>({
    compositeScore: null,
    creditRawScore: 0,
    incomeRawScore: 0,
    esgRawScore: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(2);
  const hasStartedFetching = useRef(false);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch scores on mount
  useEffect(() => {
    // Prevent double-fetching in React strict mode
    if (hasStartedFetching.current) return;
    hasStartedFetching.current = true;

    const fetchScores = async () => {
      if (!currentAssessment?.borrower) {
        setError('No borrower data available. Please start a new assessment.');
        setState('error');
        return;
      }

      const borrower = currentAssessment.borrower;
      const startTime = performance.now();
      const auditEntries: AuditEntry[] = [];

      try {
        // Fetch credit and ESG scores in parallel
        const [creditResponse, esgResponse] = await Promise.all([
          fetchCreditScore(borrower.ssn),
          fetchESGScore(borrower.companyName, borrower.industrySector),
        ]);

        // Add audit entry for credit score fetch
        auditEntries.push({
          timestamp: new Date(),
          action: 'Credit Score Fetch',
          dataSource: 'MockCreditBureau',
          details: { score: creditResponse.data.score, latencyMs: creditResponse.latencyMs },
        });

        // Add audit entry for ESG score fetch
        auditEntries.push({
          timestamp: new Date(),
          action: 'ESG Score Fetch',
          dataSource: 'MockESGProvider',
          details: { 
            score: esgResponse.data.overallScore, 
            industry: borrower.industrySector,
            latencyMs: esgResponse.latencyMs 
          },
        });

        // Calculate income/assets score from borrower data
        const incomeAssetsResult = calculateIncomeAssetsScore(
          borrower.annualIncome,
          borrower.totalAssets
        );

        // Add audit entry for income/assets calculation
        auditEntries.push({
          timestamp: new Date(),
          action: 'Income/Assets Score Calculation',
          dataSource: 'ScoringEngine',
          details: { 
            score: incomeAssetsResult.score,
            debtToIncomeRatio: incomeAssetsResult.debtToIncomeRatio,
            assetCoverageRatio: incomeAssetsResult.assetCoverageRatio,
          },
        });

        const processingTimeMs = Math.round(performance.now() - startTime);

        // Calculate composite score using scoring engine
        const compositeScore = calculateCompositeScore(
          { score: creditResponse.data.score },
          { score: incomeAssetsResult.score },
          { total: esgResponse.data.overallScore },
          processingTimeMs
        );

        // Add audit entry for composite score calculation
        auditEntries.push({
          timestamp: new Date(),
          action: 'Composite Score Calculation',
          dataSource: 'ScoringEngine',
          details: { 
            total: compositeScore.total,
            creditComponent: compositeScore.creditComponent,
            incomeComponent: compositeScore.incomeComponent,
            esgComponent: compositeScore.esgComponent,
          },
        });

        // Add audit entry for decision
        auditEntries.push({
          timestamp: new Date(),
          action: 'Decision Generated',
          dataSource: 'DecisionEngine',
          details: { decision: compositeScore.decision },
        });

        // Update local state
        setScoringData({
          compositeScore,
          creditRawScore: creditResponse.data.score,
          incomeRawScore: incomeAssetsResult.score,
          esgRawScore: esgResponse.data.overallScore,
        });

        // Build full credit score object for store
        const creditScoreObj: CreditScore = {
          score: creditResponse.data.score,
          maxScore: 850,
          history: {
            accountAge: Math.floor(creditResponse.data.factors.creditAge / 12),
            onTimePayments: creditResponse.data.factors.paymentHistory,
            creditUtilization: creditResponse.data.factors.creditUtilization,
            derogatoriesCount: creditResponse.data.accounts.delinquent + creditResponse.data.accounts.collections,
          },
          source: 'MockCreditBureau',
          fetchedAt: new Date(),
        };

        // Build full ESG score object for store
        const esgScoreObj: ESGScore = {
          total: esgResponse.data.overallScore,
          environmental: esgResponse.data.breakdown.environmental,
          social: esgResponse.data.breakdown.social,
          governance: esgResponse.data.breakdown.governance,
          industryBenchmark: Math.round(esgResponse.data.industryTotal / 2),
          source: 'MockESGProvider',
          fetchedAt: new Date(),
        };

        // Build income/assets score object for store
        const incomeAssetsScoreObj: IncomeAssetsScore = {
          debtToIncomeRatio: incomeAssetsResult.debtToIncomeRatio,
          assetCoverageRatio: incomeAssetsResult.assetCoverageRatio,
          score: incomeAssetsResult.score,
        };

        // Update store with full scoring results
        updateScoring({
          ...compositeScore,
        });

        // Generate loan terms for approved loans
        const loanTerms = calculateLoanTerms(
          compositeScore.total,
          borrower.annualIncome,
          compositeScore.decision
        );

        // Complete the assessment with all data
        // We need to update the currentAssessment with all the score data first
        const { currentAssessment: updatedAssessment, assessments } = useAppStore.getState();
        if (updatedAssessment) {
          // Build the completed assessment object
          const completedAssessment = {
            ...updatedAssessment,
            creditScore: creditScoreObj,
            esgScore: esgScoreObj,
            incomeAssetsScore: incomeAssetsScoreObj,
            compositeScore: compositeScore,
            auditTrail: [...updatedAssessment.auditTrail, ...auditEntries],
            status: 'complete' as const,
            completedAt: new Date(),
            loanTerms: loanTerms || undefined,
          };
          
          // Update both currentAssessment and add to assessments history
          useAppStore.setState({
            currentAssessment: completedAssessment,
            assessments: [completedAssessment, ...assessments],
          });
        }

        setState('complete');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch scoring data');
        setState('error');
      }
    };

    fetchScores();
  }, [currentAssessment, updateScoring, completeAssessment]);

  // Auto-navigation effect: Start countdown when scoring completes
  // Requirements: 6.1, 6.2, 6.3
  useEffect(() => {
    if (state !== 'complete') return;

    // Start countdown from 2 seconds
    setCountdown(2);
    
    // Update countdown every second
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear interval and navigate using React Router
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          navigate('/decision');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [state, navigate]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    minHeight: '100%',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1E3A8A',
    marginBottom: '24px',
    textAlign: 'center',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px',
    marginBottom: '24px',
  };

  const compositeScoreCardStyle: React.CSSProperties = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const loadingContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    border: '4px solid #E5E7EB',
    borderTopColor: '#3B82F6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const loadingTextStyle: React.CSSProperties = {
    marginTop: '16px',
    fontSize: '16px',
    color: '#6B7280',
  };

  const errorContainerStyle: React.CSSProperties = {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '600px',
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#DC2626',
    fontSize: '16px',
  };

  const processingTimeStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    marginTop: '16px',
  };

  const processingTimeLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6B7280',
  };

  const processingTimeValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  };

  const decisionContainerStyle: React.CSSProperties = {
    marginTop: '24px',
  };

  const countdownContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '24px',
    padding: '16px 24px',
    backgroundColor: '#EFF6FF',
    borderRadius: '8px',
    border: '1px solid #BFDBFE',
  };

  const countdownTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#1E40AF',
    fontWeight: 500,
  };

  const countdownProgressBarContainerStyle: React.CSSProperties = {
    width: '200px',
    height: '4px',
    backgroundColor: '#DBEAFE',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const countdownProgressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: '2px',
    transition: 'width 1s linear',
    width: `${(countdown / 2) * 100}%`,
  };

  // Render loading state
  if (state === 'loading') {
    return (
      <div style={containerStyle}>
        <h1 style={headerStyle}>Credit Assessment</h1>
        <div style={cardStyle}>
          <div style={loadingContainerStyle}>
            <style>
              {`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
            <div style={spinnerStyle} data-testid="loading-spinner" />
            <p style={loadingTextStyle}>Fetching credit and ESG data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (state === 'error') {
    return (
      <div style={containerStyle}>
        <h1 style={headerStyle}>Credit Assessment</h1>
        <div style={errorContainerStyle}>
          <p style={errorTextStyle} data-testid="error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Render complete state with scores
  const { compositeScore, creditRawScore, incomeRawScore, esgRawScore } = scoringData;

  if (!compositeScore) {
    return null;
  }

  return (
    <div style={containerStyle} data-testid="api-scoring-screen">
      <h1 style={headerStyle}>Credit Assessment</h1>
      
      {/* Composite Score Card with Gauge and Decision */}
      <div style={compositeScoreCardStyle}>
        <CompositeScoreGauge
          score={compositeScore.total}
          decision={compositeScore.decision}
        />
        
        <div style={decisionContainerStyle}>
          <DecisionIndicator decision={compositeScore.decision} />
        </div>
        
        {/* Processing Time */}
        <div style={processingTimeStyle} data-testid="processing-time">
          <span style={processingTimeLabelStyle}>Processing Time:</span>
          <span style={processingTimeValueStyle}>
            {(compositeScore.processingTimeMs / 1000).toFixed(2)}s
          </span>
        </div>

        {/* Countdown Indicator - Requirements 6.1, 6.2, 6.3 */}
        <div style={countdownContainerStyle} data-testid="navigation-countdown">
          <span style={countdownTextStyle}>
            Navigating to decision in {countdown}s...
          </span>
          <div style={countdownProgressBarContainerStyle}>
            <div style={countdownProgressBarStyle} data-testid="countdown-progress" />
          </div>
        </div>
      </div>
      
      {/* Score Breakdown */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <ScoreBreakdown
          creditComponent={compositeScore.creditComponent}
          incomeComponent={compositeScore.incomeComponent}
          esgComponent={compositeScore.esgComponent}
          creditRawScore={creditRawScore}
          incomeRawScore={incomeRawScore}
          esgRawScore={esgRawScore}
        />
      </div>
    </div>
  );
};

export default APIScoringScreen;
