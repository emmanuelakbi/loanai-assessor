# Requirements Document: LoanAI Assessor (Master)

## Introduction

LoanAI Assessor is a desktop prototype application (1440x900px) designed for the LMA EDGE Hackathon Digital Loans category. The application replaces 5-minute manual loan reviews with 30-second AI-powered automation for banks, demonstrating significant efficiency gains and cost savings in the lending industry.

## Module Specs

This master spec is supported by detailed module specifications (sibling folders in .kiro/specs/):
- #[[file:../loanai-borrower-input/requirements.md]] - Borrower data collection form
- #[[file:../loanai-api-scoring/requirements.md]] - Scoring engine and visualization
- #[[file:../loanai-decision-engine/requirements.md]] - Decision display and PDF export
- #[[file:../loanai-batch-processor/requirements.md]] - Bulk CSV processing
- #[[file:../loanai-dashboard/requirements.md]] - Metrics and ROI display
- #[[file:../loanai-demo-assets/requirements.md]] - Demo assets for hackathon

## Glossary

- **LoanAI_System**: The main desktop application that processes loan assessments
- **Borrower_Input_Module**: Component handling borrower data collection forms
- **API_Scoring_Engine**: Component that calculates composite credit scores from multiple data sources
- **Decision_Engine**: Component that auto-generates loan decisions and terms
- **Batch_Processor**: Component handling bulk CSV loan processing
- **Dashboard**: Main navigation and reporting interface
- **Composite_Score**: Weighted score (0-1000) combining Credit, Income/Assets, and ESG factors
- **Credit_Bureau_API**: Mock external service providing credit history data
- **ESG_Data_Provider**: Mock external service providing environmental/social/governance scores
- **Audit_Trail**: Complete record of all data sources and decision factors

## Requirements

### Requirement 1: Dashboard and Navigation

**User Story:** As a loan officer, I want a central dashboard with navigation, so that I can access all assessment features and view recent activity.

#### Acceptance Criteria

1. WHEN the application launches, THE Dashboard SHALL display a sidebar navigation with menu items: Dashboard, New Assessment, Batch Process, Reports
2. WHEN the Dashboard loads, THE LoanAI_System SHALL display a summary of recent assessments with borrower name, score, and decision status
3. WHEN a user clicks a sidebar menu item, THE LoanAI_System SHALL navigate to the corresponding screen without page reload
4. THE Dashboard SHALL display key metrics: total assessments today, approval rate, average processing time
5. WHEN hovering over a recent assessment row, THE Dashboard SHALL highlight the row and show a "View Details" action
6. THE Dashboard SHALL use the fintech color scheme (#1E3A8A primary blue, #F8FAFC background white)
7. THE Dashboard SHALL render at exactly 1440x900 pixels for desktop display

### Requirement 2: Borrower Input Form

**User Story:** As a loan officer, I want to input borrower information through a structured form, so that I can initiate the AI-powered assessment process.

#### Acceptance Criteria

1. WHEN a user navigates to New Assessment, THE Borrower_Input_Module SHALL display a form with fields: Full Name, SSN (masked), Annual Income, Total Assets, Company Name, Industry Sector
2. THE Borrower_Input_Module SHALL validate SSN format as XXX-XX-XXXX with real-time masking
3. THE Borrower_Input_Module SHALL validate Annual Income and Total Assets as positive currency values
4. THE Borrower_Input_Module SHALL provide Industry Sector as a dropdown with options: Technology, Healthcare, Manufacturing, Finance, Energy, Retail, Agriculture, Construction
5. WHEN all required fields are valid, THE Borrower_Input_Module SHALL enable the "Fetch Data" button
6. WHEN a user clicks "Fetch Data", THE Borrower_Input_Module SHALL display a loading spinner with "Fetching credit data..." message
7. IF any required field is empty or invalid, THEN THE Borrower_Input_Module SHALL display inline validation errors and disable submission
8. WHEN data fetching completes successfully, THE LoanAI_System SHALL navigate to the API Scoring screen

### Requirement 3: API Scoring and Composite Score Calculation

**User Story:** As a loan officer, I want to see a real-time composite score with detailed breakdown, so that I can understand the AI's assessment rationale.

#### Acceptance Criteria

1. WHEN the API Scoring screen loads, THE API_Scoring_Engine SHALL display a composite score gauge (0-1000 scale) with animated fill
2. THE API_Scoring_Engine SHALL calculate composite score using weights: Credit Score (40%), Income/Assets Ratio (30%), ESG Score (30%)
3. THE API_Scoring_Engine SHALL display individual score breakdown bars for each component with percentage contribution
4. WHEN fetching Credit Score, THE API_Scoring_Engine SHALL call the mock Credit_Bureau_API and display result (e.g., 720/850)
5. THE API_Scoring_Engine SHALL calculate Debt-to-Income ratio from Annual Income and display as percentage (e.g., 28%)
6. WHEN fetching ESG Score, THE API_Scoring_Engine SHALL call the mock ESG_Data_Provider based on Industry and display result (e.g., 85/100)
7. THE API_Scoring_Engine SHALL display data source attribution for each score component
8. WHEN composite score exceeds 750, THE API_Scoring_Engine SHALL display green approval indicator (🟢)
9. WHEN composite score is between 600-750, THE API_Scoring_Engine SHALL display yellow review indicator (🟡)
10. WHEN composite score is below 600, THE API_Scoring_Engine SHALL display red rejection indicator (🔴)
11. WHEN scoring completes, THE LoanAI_System SHALL automatically navigate to Decision screen after 2-second delay

### Requirement 4: Decision and Loan Terms Generation

**User Story:** As a loan officer, I want auto-generated loan terms with PDF preview, so that I can quickly finalize and export approved loans.

#### Acceptance Criteria

1. WHEN the Decision screen loads, THE Decision_Engine SHALL display the final decision (Approved/Review/Rejected) with corresponding color indicator
2. IF decision is Approved, THEN THE Decision_Engine SHALL generate loan terms including: Principal Amount, Interest Rate, Term Length, Monthly Payment
3. THE Decision_Engine SHALL display a PDF preview mock showing the generated loan terms document
4. THE Decision_Engine SHALL display complete audit trail showing all data sources, timestamps, and score calculations
5. WHEN a user clicks "Export PDF", THE Decision_Engine SHALL trigger a download of the loan terms document
6. WHEN a user clicks "New Assessment", THE LoanAI_System SHALL navigate back to the Borrower Input screen
7. THE Decision_Engine SHALL display processing time comparison: "AI: 30 seconds vs Manual: 5 minutes"

### Requirement 5: Batch Processing Mode

**User Story:** As a loan operations manager, I want to process multiple loans via CSV upload, so that I can demonstrate enterprise-scale efficiency.

#### Acceptance Criteria

1. WHEN a user navigates to Batch Process, THE Batch_Processor SHALL display a CSV upload dropzone with drag-and-drop support
2. THE Batch_Processor SHALL accept CSV files with columns: name, ssn, annual_income, assets, company, industry
3. WHEN a CSV is uploaded, THE Batch_Processor SHALL validate file format and display row count
4. WHEN processing begins, THE Batch_Processor SHALL display a progress bar with percentage and "Processing loan X of Y" message
5. WHEN processing completes, THE Batch_Processor SHALL display results table with columns: Borrower, Score, Decision, Processing Time
6. THE Batch_Processor SHALL display summary metrics: Total Processed, Approved Count, Review Count, Rejected Count, Total Time
7. THE Batch_Processor SHALL display efficiency comparison: "1000 loans: Manual 5min×1000=83hrs vs AI 30s×1000=8.3hrs"
8. WHEN a user clicks a result row, THE Batch_Processor SHALL expand to show individual score breakdown
9. WHEN a user clicks "Export Results", THE Batch_Processor SHALL download a CSV with all results

### Requirement 6: Business Metrics and ROI Display

**User Story:** As a bank executive, I want to see quantified business impact metrics, so that I can evaluate the solution's value proposition.

#### Acceptance Criteria

1. THE Dashboard SHALL display time savings metric: "Manual: 5min/loan × 100 loans/day = 500min vs AI: 30s/loan = 50min"
2. THE Dashboard SHALL display cost savings metric: "70% time savings = $2M/year per 100 loan officers"
3. THE Dashboard SHALL display market opportunity metric: "$5T loan market → 1% capture = $50B opportunity"
4. WHEN viewing batch results, THE Batch_Processor SHALL display per-batch ROI calculation
5. THE LoanAI_System SHALL include animated counters for key metrics on the Dashboard

### Requirement 7: Mock API Data Services

**User Story:** As a developer, I want realistic mock API responses, so that the prototype demonstrates real-world data integration.

#### Acceptance Criteria

1. THE Credit_Bureau_API SHALL return mock credit scores between 300-850 with credit history details
2. THE ESG_Data_Provider SHALL return industry-specific ESG scores between 0-100 with breakdown by Environmental, Social, Governance
3. WHEN API calls are made, THE LoanAI_System SHALL simulate network latency of 500-1500ms for realistic UX
4. THE mock APIs SHALL return consistent scores for the same SSN input (deterministic for demo)
5. IF an API call fails, THEN THE LoanAI_System SHALL display error state and retry option

### Requirement 8: UI/UX Design Standards

**User Story:** As a hackathon judge, I want a polished fintech UI, so that I can evaluate design usability and professional quality.

#### Acceptance Criteria

1. THE LoanAI_System SHALL use primary color #1E3A8A (dark blue) for headers, buttons, and accents
2. THE LoanAI_System SHALL use background color #F8FAFC (off-white) for content areas
3. THE LoanAI_System SHALL use success color #10B981 (green), warning color #F59E0B (amber), error color #EF4444 (red)
4. THE LoanAI_System SHALL use Inter or system sans-serif font family with sizes: 24px headers, 16px body, 14px labels
5. THE LoanAI_System SHALL include smooth transitions (200ms ease) for all interactive elements
6. THE LoanAI_System SHALL display loading states with skeleton screens or spinners for all async operations
7. THE LoanAI_System SHALL be keyboard accessible with visible focus indicators
