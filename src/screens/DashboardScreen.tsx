import React, { useMemo, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { MetricsCards, RecentAssessments, ROICalculator } from '../components/Dashboard';
import { calculateMetrics } from '../services/metricsEngine';
import type { Assessment } from '../types';

/**
 * DashboardScreen - Main dashboard view composing MetricsCards, RecentAssessments, and ROICalculator
 * 
 * Design Specifications (from design.md):
 * - Main Content: 1200px width, #F8FAFC background
 * - Metrics Cards at top (4 cards: Today's Assessments, Approval Rate, Avg Time, Time Saved)
 * - Recent Assessments table below
 * - ROI Calculator section at bottom
 * 
 * Requirements:
 * - 1.1: WHEN the application launches, THE Dashboard SHALL display a sidebar navigation
 *        with menu items: Dashboard, New Assessment, Batch Process, Reports
 * - 1.2: WHEN the Dashboard loads, THE LoanAI_System SHALL display a summary of recent
 *        assessments with borrower name, score, and decision status
 * - 1.4: THE Dashboard SHALL display key metrics: total assessments today, approval rate,
 *        average processing time
 * 
 * Architecture:
 * - MetricsCards: Four metric cards with animated counters (Requirement 1.4)
 * - RecentAssessments: Table with recent assessments (Requirement 1.2)
 * - ROICalculator: ROI metrics display (Requirements 6.1, 6.2, 6.3)
 * 
 * Real-time Updates:
 * - Component subscribes to assessments from Zustand store
 * - Zustand automatically triggers re-renders when assessments change
 * - Metrics are recalculated via useMemo when assessments array changes
 */
export const DashboardScreen: React.FC = () => {
  // Get assessments from the Zustand store
  const assessments = useAppStore((state) => state.assessments);
  
  // Calculate metrics using the metricsEngine
  // Memoized to only recalculate when assessments change (Requirement 1.4)
  const metrics = useMemo(
    () => calculateMetrics(assessments),
    [assessments]
  );

  // Handle View Details click - navigate to decision screen with selected assessment
  const handleViewDetails = useCallback((assessment: Assessment) => {
    // Store the selected assessment and navigate to decision screen
    // For now, we'll just log - full implementation would set currentAssessment
    console.log('View details for assessment:', assessment.id);
    // Could navigate to decision screen: setScreen('decision');
  }, []);

  return (
    <div
      className="p-8 space-y-6 bg-[#F8FAFC] min-h-full"
      data-testid="dashboard-screen"
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1E3A8A]">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of loan assessment metrics and recent activity
        </p>
      </div>

      {/* Metrics Cards Section - Requirement 1.4 */}
      <section aria-label="Key Metrics">
        <MetricsCards metrics={metrics} animationDuration={1000} />
      </section>

      {/* Recent Assessments Section - Requirement 1.2 */}
      <section aria-label="Recent Assessments">
        <RecentAssessments 
          assessments={assessments} 
          maxItems={10}
          onViewDetails={handleViewDetails}
        />
      </section>

      {/* ROI Calculator Section - Requirements 6.1, 6.2, 6.3 */}
      <section aria-label="ROI Calculator">
        <ROICalculator 
          loansPerDay={100}
          manualTimeMinutes={5}
          aiTimeSeconds={30}
          costSavingsMillions={2}
          loanOfficerCount={100}
          marketSizeTrillions={5}
          marketCapturePercent={1}
        />
      </section>
    </div>
  );
};

export default DashboardScreen;
