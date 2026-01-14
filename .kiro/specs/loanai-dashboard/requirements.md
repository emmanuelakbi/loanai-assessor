# Requirements Document: Dashboard Module

## Introduction

The Dashboard Module provides a central hub for viewing assessment metrics, recent activity, and ROI calculations. It serves as the landing page and demonstrates business value.

## Glossary

- **Dashboard**: Main navigation and reporting interface
- **MetricsCards**: Summary cards showing key performance indicators
- **RecentAssessments**: Table of latest loan assessments
- **ROICalculator**: Component displaying business value metrics

## Requirements

### Requirement 1: Navigation and Layout

**User Story:** As a loan officer, I want a central dashboard.

#### Acceptance Criteria

1. WHEN application launches, THE Dashboard SHALL be the default screen
2. THE Dashboard SHALL display sidebar navigation: Dashboard, New Assessment, Batch Process, Reports
3. THE sidebar SHALL highlight the currently active item
4. THE Dashboard SHALL render at 1440x900 pixels

### Requirement 2: Metrics Display

**User Story:** As a loan officer, I want to see key metrics.

#### Acceptance Criteria

1. THE Dashboard SHALL display "Today's Assessments" count
2. THE Dashboard SHALL display "Approval Rate" percentage
3. THE Dashboard SHALL display "Average Time per Loan" in seconds
4. THE Dashboard SHALL display "Time Saved" percentage vs manual
5. THE MetricsCards SHALL animate values on load

### Requirement 3: Recent Assessments

**User Story:** As a loan officer, I want to see recent assessments.

#### Acceptance Criteria

1. THE Dashboard SHALL display table of recent assessments (max 10)
2. THE table SHALL show: Name, Score, Decision, Time (relative)
3. WHEN hovering row, THE Dashboard SHALL highlight it
4. THE table SHALL display most recent first

### Requirement 4: ROI Calculator

**User Story:** As a bank executive, I want to see ROI metrics.

#### Acceptance Criteria

1. THE ROICalculator SHALL display time savings: "Manual: 5min × 100 = 500min vs AI: 30s × 100 = 50min"
2. THE ROICalculator SHALL display cost savings: "$2M/year per 100 loan officers"
3. THE ROICalculator SHALL display market opportunity: "$5T market → 1% = $50B"

### Requirement 5: Metrics Accuracy

**User Story:** As a data analyst, I want accurate metrics.

#### Acceptance Criteria

1. THE "Today's Assessments" SHALL equal assessments where createdAt is today
2. THE "Approval Rate" SHALL equal (approved / total) × 100
3. THE "Average Time" SHALL equal sum(processingTime) / count
4. THE metrics SHALL update when new assessments are added
