# Implementation Plan: LoanAI Assessor

## Overview

This implementation plan builds the LoanAI Assessor desktop prototype as a React/TypeScript single-page application. Tasks are organized to deliver incremental, testable functionality with property-based tests validating core business logic.

## Tasks

- [x] 1. Project Setup and Core Infrastructure
  - [x] 1.1 Initialize Vite React TypeScript project with Tailwind CSS
    - Create project with `npm create vite@latest loanai-assessor -- --template react-ts`
    - Install dependencies: tailwindcss, zustand, react-router-dom, recharts, papaparse, @react-pdf/renderer, fast-check
    - Configure Tailwind with fintech color theme (#1E3A8A, #F8FAFC, #10B981, #F59E0B, #EF4444)
    - Set viewport to 1440x900 in index.html
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 1.7_

  - [x] 1.2 Create TypeScript type definitions
    - Create `src/types/index.ts` with all interfaces: Borrower, CreditScore, ESGScore, CompositeScore, LoanTerms, Assessment, BatchJob
    - Create `src/types/api.ts` with API response types
    - _Requirements: 3.2, 4.2, 5.2_

  - [x] 1.3 Set up Zustand state store
    - Create `src/store/appStore.ts` with AppStore interface
    - Implement navigation state, assessment workflow, batch processing state
    - _Requirements: 1.3, 2.8, 3.11_

  - [x] 1.4 Configure React Router with screen routes
    - Create `src/App.tsx` with routes: /, /new, /scoring, /decision, /batch
    - _Requirements: 1.3_

- [x] 2. Layout and Navigation Components
  - [x] 2.1 Create Sidebar navigation component
    - Create `src/components/Layout/Sidebar.tsx` with logo, nav items
    - Style: 240px width, #1E3A8A background, white text
    - Active state highlighting for current route
    - _Requirements: 1.1, 1.3, 8.1_

  - [x] 2.2 Create main Layout wrapper component
    - Create `src/components/Layout/Layout.tsx` with sidebar + main content area
    - Main content: 1200px width, #F8FAFC background
    - _Requirements: 1.1, 1.7_

- [ ] 3. Mock API Services
  - [ ] 3.1 Implement Credit Bureau mock API
    - Create `src/services/mockCreditBureau.ts`
    - Generate deterministic scores based on SSN hash (300-850 range)
    - Include credit history factors
    - Simulate 500-1500ms latency
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 3.2 Implement ESG Provider mock API
    - Create `src/services/mockESGProvider.ts`
    - Generate industry-specific scores (0-100 range)
    - Include E/S/G breakdown
    - Simulate 500-1500ms latency
    - _Requirements: 7.2, 7.3_

  - [ ] 3.3 Write property tests for mock API validity
    - **Property 4: Mock API Response Validity**
    - Test credit scores in [300, 850] range
    - Test ESG scores in [0, 100] range
    - Test latency in [500ms, 1500ms] range
    - Test SSN determinism (same SSN → same score)
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

- [ ] 4. Scoring Engine Implementation
  - [ ] 4.1 Implement composite score calculation
    - Create `src/services/scoringEngine.ts`
    - Implement weighted calculation: Credit 40%, Income 30%, ESG 30%
    - Implement decision thresholds: >750 APPROVED, 600-750 REVIEW, <600 REJECTED
    - _Requirements: 3.2, 3.8, 3.9, 3.10_

  - [ ] 4.2 Implement income/assets score calculation
    - Calculate debt-to-income ratio
    - Calculate asset coverage ratio
    - Normalize to 0-100 score
    - _Requirements: 3.5_

  - [ ] 4.3 Write property tests for composite score calculation
    - **Property 1: Composite Score Calculation Accuracy**
    - Test weighted formula produces correct totals
    - Test score always in [0, 1000] range
    - **Validates: Requirements 3.2**

  - [ ] 4.4 Write property tests for decision thresholds
    - **Property 2: Decision Threshold Consistency**
    - Test all threshold boundaries
    - Test determinism across invocations
    - **Validates: Requirements 3.8, 3.9, 3.10**

- [ ] 5. Checkpoint - Core Services Complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 6. Borrower Input Screen
  - [ ] 6.1 Create form input components
    - Create `src/components/Form/TextInput.tsx` with validation states
    - Create `src/components/Form/SSNInput.tsx` with masking (XXX-XX-XXXX)
    - Create `src/components/Form/CurrencyInput.tsx` with formatting
    - Create `src/components/Form/IndustrySelect.tsx` with dropdown options
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 6.2 Create BorrowerForm component with validation
    - Create `src/components/BorrowerInput/BorrowerForm.tsx`
    - Implement real-time validation for all fields
    - Enable/disable Fetch Data button based on form validity
    - _Requirements: 2.5, 2.7_

  - [ ] 6.3 Create BorrowerInputScreen with loading state
    - Create `src/screens/BorrowerInputScreen.tsx`
    - Implement loading spinner on Fetch Data click
    - Navigate to scoring screen on success
    - _Requirements: 2.6, 2.8_

  - [ ] 6.4 Write property tests for form validation
    - **Property 3: Form Validation Correctness**
    - Test SSN pattern validation
    - Test currency validation (positive values)
    - Test form state (valid/invalid → button enabled/disabled)
    - **Validates: Requirements 2.2, 2.3, 2.5, 2.7**

- [ ] 7. API Scoring Screen
  - [ ] 7.1 Create CompositeScoreGauge component
    - Create `src/components/Scoring/CompositeScoreGauge.tsx`
    - Animated arc gauge (0-1000 scale)
    - Color based on decision (green/yellow/red)
    - _Requirements: 3.1_

  - [ ] 7.2 Create ScoreBreakdown component
    - Create `src/components/Scoring/ScoreBreakdown.tsx`
    - Three progress bars: Credit, Income/Assets, ESG
    - Show raw scores and weighted contributions
    - Data source attribution for each
    - _Requirements: 3.3, 3.7_

  - [ ] 7.3 Create DecisionIndicator component
    - Create `src/components/Scoring/DecisionIndicator.tsx`
    - Display 🟢 APPROVED / 🟡 REVIEW / 🔴 REJECTED
    - _Requirements: 3.8, 3.9, 3.10_

  - [ ] 7.4 Create APIScoringScreen with data fetching
    - Create `src/screens/APIScoringScreen.tsx`
    - Fetch credit and ESG scores on mount
    - Calculate composite score
    - Auto-navigate to decision after 2s delay
    - _Requirements: 3.4, 3.6, 3.11_

- [ ] 8. Decision Screen
  - [ ] 8.1 Create LoanTermsCard component
    - Create `src/components/Decision/LoanTermsCard.tsx`
    - Display principal, rate, term, monthly payment
    - Only render for APPROVED decisions
    - _Requirements: 4.2_

  - [ ] 8.2 Create AuditTrail component
    - Create `src/components/Decision/AuditTrail.tsx`
    - Display timestamped entries with data sources
    - Monospace font, alternating row colors
    - _Requirements: 4.4_

  - [ ] 8.3 Create PDFPreview component
    - Create `src/components/Decision/PDFPreview.tsx`
    - Mock PDF document preview
    - Show loan terms in document format
    - _Requirements: 4.3_

  - [ ] 8.4 Create DecisionScreen with export functionality
    - Create `src/screens/DecisionScreen.tsx`
    - Decision banner with color indicator
    - Export PDF button (download)
    - New Assessment button (navigate back)
    - Processing time comparison display
    - _Requirements: 4.1, 4.5, 4.6, 4.7_

  - [ ] 8.5 Write property tests for audit trail completeness
    - **Property 6: Audit Trail Completeness**
    - Test all required entries present
    - Test chronological ordering
    - Test non-empty data sources
    - **Validates: Requirements 4.4**

  - [ ] 8.6 Write property tests for loan terms generation
    - **Property 7: Loan Terms Generation for Approved Loans**
    - Test terms generated for APPROVED
    - Test terms values are valid
    - Test monthly payment calculation
    - **Validates: Requirements 4.2**

- [ ] 9. Checkpoint - Single Assessment Flow Complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 10. Dashboard Screen
  - [ ] 10.1 Create MetricsCards component
    - Create `src/components/Dashboard/MetricsCards.tsx`
    - Four cards: Today's Assessments, Approval Rate, Avg Time, Time Saved
    - Animated counters for values
    - _Requirements: 1.4, 6.5_

  - [ ] 10.2 Create RecentAssessments component
    - Create `src/components/Dashboard/RecentAssessments.tsx`
    - Table with Name, Score, Decision, Time columns
    - Row hover highlighting with View Details action
    - _Requirements: 1.2, 1.5_

  - [ ] 10.3 Create ROICalculator component
    - Create `src/components/Dashboard/ROICalculator.tsx`
    - Display time savings calculation
    - Display cost savings ($2M/year)
    - Display market opportunity ($5T)
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 10.4 Create DashboardScreen
    - Create `src/screens/DashboardScreen.tsx`
    - Compose MetricsCards, RecentAssessments, ROICalculator
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 10.5 Write property tests for dashboard metrics accuracy
    - **Property 8: Dashboard Metrics Accuracy**
    - Test todayAssessments count
    - Test approvalRate calculation
    - Test averageTimeSeconds calculation
    - **Validates: Requirements 1.4, 6.4**

- [ ] 11. Batch Processor Screen
  - [ ] 11.1 Create CSVDropzone component
    - Create `src/components/Batch/CSVDropzone.tsx`
    - Drag-and-drop file upload
    - File validation (CSV format, required columns)
    - Display row count after upload
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 11.2 Create BatchProgressBar component
    - Create `src/components/Batch/BatchProgressBar.tsx`
    - Animated progress bar with percentage
    - "Processing loan X of Y" message
    - _Requirements: 5.4_

  - [ ] 11.3 Create BatchResultsTable component
    - Create `src/components/Batch/BatchResultsTable.tsx`
    - Virtualized table for 1000+ rows
    - Columns: Borrower, Score, Decision, Time
    - Expandable rows for score breakdown
    - _Requirements: 5.5, 5.8_

  - [ ] 11.4 Create BatchSummary component
    - Create `src/components/Batch/BatchSummary.tsx`
    - Four summary cards: Processed, Approved, Review, Rejected
    - Efficiency comparison display
    - _Requirements: 5.6, 5.7_

  - [ ] 11.5 Create BatchProcessorScreen with CSV processing
    - Create `src/screens/BatchProcessorScreen.tsx`
    - Parse CSV with PapaParse
    - Process each row through scoring engine
    - Export results as CSV
    - _Requirements: 5.1, 5.9_

  - [ ] 11.6 Write property tests for batch processing accuracy
    - **Property 5: Batch Processing Accuracy**
    - Test results.length equals totalRows
    - Test summary counts match results
    - Test each decision matches score threshold
    - **Validates: Requirements 5.5, 5.6**

- [ ] 12. Final Integration and Polish
  - [ ] 12.1 Wire all screens together
    - Ensure navigation flow works end-to-end
    - Test single assessment: Input → Scoring → Decision
    - Test batch flow: Upload → Process → Results
    - _Requirements: 1.3, 2.8, 3.11_

  - [ ] 12.2 Add loading states and transitions
    - Skeleton screens for async operations
    - 200ms ease transitions on interactive elements
    - _Requirements: 8.5, 8.6_

  - [ ] 12.3 Implement keyboard accessibility
    - Tab navigation through all interactive elements
    - Visible focus indicators
    - _Requirements: 8.7_

  - [ ] 12.4 Create sample demo data
    - Create `src/data/sampleBorrowers.ts` with 5 demo borrowers
    - Create `src/data/sampleBatch.csv` with 1000 rows
    - _Requirements: 5.2_

- [ ] 13. Final Checkpoint - All Features Complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Use fast-check library for property-based testing with minimum 100 iterations per test
