import type { Assessment, DashboardMetrics } from '../types';

/**
 * Manual processing time baseline in milliseconds (5 minutes)
 * Used to calculate time saved percentage
 */
const MANUAL_TIME_MS = 5 * 60 * 1000;

/**
 * Calculates dashboard metrics from a list of assessments.
 * 
 * Metrics calculated:
 * - todayAssessments: Count of assessments created today
 * - approvalRate: Percentage of today's assessments that were approved
 * - averageTimeSeconds: Average processing time in seconds for today's assessments
 * - timeSavedPercent: Percentage of time saved compared to manual processing (5 min baseline)
 * 
 * @param assessments - Array of Assessment objects to calculate metrics from
 * @returns DashboardMetrics object with calculated values
 * 
 * @validates Requirements 5.1, 5.2, 5.3
 */
export function calculateMetrics(assessments: Assessment[]): DashboardMetrics {
  const today = new Date().toDateString();
  
  // Filter assessments created today (Requirement 5.1)
  const todayAssessments = assessments.filter(
    (a) => a.createdAt.toDateString() === today
  );
  
  // Count approved assessments for approval rate (Requirement 5.2)
  const approved = todayAssessments.filter(
    (a) => a.compositeScore.decision === 'APPROVED'
  ).length;
  
  // Calculate total processing time for average (Requirement 5.3)
  const totalTime = todayAssessments.reduce(
    (sum, a) => sum + a.compositeScore.processingTimeMs,
    0
  );
  
  // Calculate average time in milliseconds
  const avgTimeMs = todayAssessments.length > 0 
    ? totalTime / todayAssessments.length 
    : 0;
  
  // Calculate time saved percentage compared to manual processing
  const timeSaved = ((MANUAL_TIME_MS - avgTimeMs) / MANUAL_TIME_MS) * 100;
  
  return {
    todayAssessments: todayAssessments.length,
    approvalRate: todayAssessments.length > 0 
      ? (approved / todayAssessments.length) * 100 
      : 0,
    averageTimeSeconds: avgTimeMs / 1000,
    timeSavedPercent: Math.max(0, timeSaved),
  };
}
