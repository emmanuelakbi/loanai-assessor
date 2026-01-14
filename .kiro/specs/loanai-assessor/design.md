# Design Document: LoanAI Assessor

## Overview

LoanAI Assessor is a desktop prototype application built for the LMA EDGE Hackathon Digital Loans category. The application demonstrates AI-powered loan assessment automation, reducing manual 5-minute reviews to 30-second automated decisions. Built as a single-page application with React/TypeScript, it features five core screens: Dashboard, Borrower Input, API Scoring, Decision Output, and Batch Processor.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LoanAI Assessor Desktop App                   │
│                        (1440x900 viewport)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Sidebar  │  │              Main Content Area              │  │
│  │   Nav    │  │  ┌─────────────────────────────────────┐   │  │
│  │          │  │  │         Screen Components           │   │  │
│  │ Dashboard│  │  │  - DashboardScreen                  │   │  │
│  │ New Loan │  │  │  - BorrowerInputScreen              │   │  │
│  │ Batch    │  │  │  - APIScoringScreen                 │   │  │
│  │ Reports  │  │  │  - DecisionScreen                   │   │  │
│  │          │  │  │  - BatchProcessorScreen             │   │  │
│  └──────────┘  │  └─────────────────────────────────────┘   │  │
├─────────────────────────────────────────────────────────────────┤
│                        State Management                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │ Assessment  │  │   Scoring   │  │   Batch Processing  │     │
│  │   Store     │  │    Store    │  │       Store         │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│                      Mock API Services                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │Credit Bureau│  │ESG Provider │  │  Loan Terms Engine  │     │
│  │    Mock     │  │    Mock     │  │                     │     │
│  └─────────────┘  └─────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom fintech theme
- **State Management**: Zustand for lightweight global state
- **Routing**: React Router v6 for SPA navigation
- **Charts/Gauges**: Recharts for score visualizations
- **PDF Generation**: @react-pdf/renderer for loan terms export
- **CSV Parsing**: Papa Parse for batch file processing
- **Build Tool**: Vite for fast development and bundling


## Components and Interfaces

### Core Type Definitions

```typescript
// Borrower data model
interface Borrower {
  id: string;
  fullName: string;
  ssn: string; // Stored masked: XXX-XX-1234
  annualIncome: number;
  totalAssets: number;
  companyName: string;
  industrySector: IndustrySector;
  createdAt: Date;
}

type IndustrySector = 
  | 'Technology' | 'Healthcare' | 'Manufacturing' 
  | 'Finance' | 'Energy' | 'Retail' | 'Agriculture' | 'Construction';

// Scoring models
interface CreditScore {
  score: number;        // 300-850
  maxScore: 850;
  history: CreditHistory;
  source: 'MockCreditBureau';
  fetchedAt: Date;
}

interface CreditHistory {
  accountAge: number;   // years
  onTimePayments: number; // percentage
  creditUtilization: number; // percentage
  derogatoriesCount: number;
}

interface ESGScore {
  total: number;        // 0-100
  environmental: number;
  social: number;
  governance: number;
  industryBenchmark: number;
  source: 'MockESGProvider';
  fetchedAt: Date;
}

interface IncomeAssetsScore {
  debtToIncomeRatio: number; // percentage
  assetCoverageRatio: number;
  score: number;        // normalized 0-100
}

interface CompositeScore {
  total: number;        // 0-1000
  creditComponent: number;    // 40% weight, max 400
  incomeComponent: number;    // 30% weight, max 300
  esgComponent: number;       // 30% weight, max 300
  decision: LoanDecision;
  processingTimeMs: number;
}

type LoanDecision = 'APPROVED' | 'REVIEW' | 'REJECTED';

// Loan terms for approved loans
interface LoanTerms {
  principalAmount: number;
  interestRate: number;     // annual percentage
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  generatedAt: Date;
}

// Audit trail entry
interface AuditEntry {
  timestamp: Date;
  action: string;
  dataSource: string;
  details: Record<string, unknown>;
}

// Assessment record
interface Assessment {
  id: string;
  borrower: Borrower;
  creditScore: CreditScore;
  esgScore: ESGScore;
  incomeAssetsScore: IncomeAssetsScore;
  compositeScore: CompositeScore;
  loanTerms?: LoanTerms;
  auditTrail: AuditEntry[];
  status: 'pending' | 'scoring' | 'complete';
  createdAt: Date;
  completedAt?: Date;
}

// Batch processing
interface BatchJob {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  results: BatchResult[];
  status: 'uploading' | 'validating' | 'processing' | 'complete' | 'error';
  startedAt: Date;
  completedAt?: Date;
  summary?: BatchSummary;
}

interface BatchResult {
  rowIndex: number;
  borrowerName: string;
  compositeScore: number;
  decision: LoanDecision;
  processingTimeMs: number;
  error?: string;
}

interface BatchSummary {
  totalProcessed: number;
  approvedCount: number;
  reviewCount: number;
  rejectedCount: number;
  errorCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
}
```


### Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavItem (Dashboard)
│   │   ├── NavItem (New Assessment)
│   │   ├── NavItem (Batch Process)
│   │   └── NavItem (Reports)
│   └── MainContent
│       └── Router
│           ├── DashboardScreen
│           │   ├── MetricsCards
│           │   ├── RecentAssessments
│           │   └── ROICalculator
│           ├── BorrowerInputScreen
│           │   ├── BorrowerForm
│           │   │   ├── TextInput (Name)
│           │   │   ├── SSNInput (masked)
│           │   │   ├── CurrencyInput (Income)
│           │   │   ├── CurrencyInput (Assets)
│           │   │   ├── TextInput (Company)
│           │   │   └── IndustrySelect
│           │   └── FetchDataButton
│           ├── APIScoringScreen
│           │   ├── CompositeScoreGauge
│           │   ├── ScoreBreakdown
│           │   │   ├── CreditScoreBar
│           │   │   ├── IncomeAssetsBar
│           │   │   └── ESGScoreBar
│           │   ├── DataSourceAttribution
│           │   └── DecisionIndicator
│           ├── DecisionScreen
│           │   ├── DecisionBanner
│           │   ├── LoanTermsCard
│           │   ├── PDFPreview
│           │   ├── AuditTrail
│           │   └── ActionButtons
│           └── BatchProcessorScreen
│               ├── CSVDropzone
│               ├── ProgressBar
│               ├── ResultsTable
│               ├── BatchSummary
│               └── EfficiencyMetrics
```

### Screen Specifications

#### Screen 1: Dashboard (1440x900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │          │ │  LoanAI Assessor                    [User] [Settings]│ │
│ │  LOGO    │ ├──────────────────────────────────────────────────────┤ │
│ │          │ │                                                      │ │
│ │ ──────── │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │ │
│ │ Dashboard│ │  │Today's  │ │Approval │ │Avg Time │ │Time     │   │ │
│ │ ──────── │ │  │Assess.  │ │Rate     │ │/Loan    │ │Saved    │   │ │
│ │ New Loan │ │  │   47    │ │  72%    │ │  28s    │ │  94%    │   │ │
│ │ Batch    │ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │ │
│ │ Reports  │ │                                                      │ │
│ │          │ │  Recent Assessments                                  │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ Name          │ Score │ Decision │ Time       │ │ │
│ │          │ │  ├───────────────┼───────┼──────────┼────────────┤ │ │
│ │          │ │  │ John Smith    │  782  │ 🟢 APPR  │ 2min ago   │ │ │
│ │          │ │  │ Jane Doe      │  645  │ 🟡 REV   │ 5min ago   │ │ │
│ │          │ │  │ Bob Wilson    │  521  │ 🔴 REJ   │ 12min ago  │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  ROI Calculator                                      │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ Manual: 5min × 100 loans = 500min/day          │ │ │
│ │          │ │  │ AI:     30s × 100 loans =  50min/day           │ │ │
│ │          │ │  │ ─────────────────────────────────────          │ │ │
│ │          │ │  │ 💰 $2M/year savings per 100 loan officers      │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

Sidebar: 240px width, #1E3A8A background
Main Content: 1200px width, #F8FAFC background
Metrics Cards: 280px × 120px each, white with shadow
```


#### Screen 2: Borrower Input Form (1440x900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │  LOGO    │ │  New Loan Assessment                                 │ │
│ │          │ ├──────────────────────────────────────────────────────┤ │
│ │ ──────── │ │                                                      │ │
│ │ Dashboard│ │  ┌────────────────────────────────────────────────┐ │ │
│ │ ──────── │ │  │  Borrower Information                          │ │ │
│ │ New Loan │ │  │                                                 │ │ │
│ │ Batch    │ │  │  Full Name *                                    │ │ │
│ │ Reports  │ │  │  ┌─────────────────────────────────────────┐   │ │ │
│ │          │ │  │  │ John Smith                              │   │ │ │
│ │          │ │  │  └─────────────────────────────────────────┘   │ │ │
│ │          │ │  │                                                 │ │ │
│ │          │ │  │  SSN *                    Annual Income *       │ │ │
│ │          │ │  │  ┌─────────────────┐     ┌─────────────────┐   │ │ │
│ │          │ │  │  │ XXX-XX-1234     │     │ $ 125,000       │   │ │ │
│ │          │ │  │  └─────────────────┘     └─────────────────┘   │ │ │
│ │          │ │  │                                                 │ │ │
│ │          │ │  │  Total Assets *          Company Name *         │ │ │
│ │          │ │  │  ┌─────────────────┐     ┌─────────────────┐   │ │ │
│ │          │ │  │  │ $ 450,000       │     │ Acme Corp       │   │ │ │
│ │          │ │  │  └─────────────────┘     └─────────────────┘   │ │ │
│ │          │ │  │                                                 │ │ │
│ │          │ │  │  Industry Sector *                              │ │ │
│ │          │ │  │  ┌─────────────────────────────────────────┐   │ │ │
│ │          │ │  │  │ Technology                          ▼   │   │ │ │
│ │          │ │  │  └─────────────────────────────────────────┘   │ │ │
│ │          │ │  │                                                 │ │ │
│ │          │ │  │  ┌─────────────────────────────────────────┐   │ │ │
│ │          │ │  │  │           🔍 Fetch Data                 │   │ │ │
│ │          │ │  │  └─────────────────────────────────────────┘   │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

Form Card: 600px width, centered, white background, 24px padding
Input Fields: 100% width, 48px height, #E5E7EB border
Fetch Button: 100% width, 56px height, #1E3A8A background, white text
```

#### Screen 3: API Scoring Visualization (1440x900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │  LOGO    │ │  Credit Assessment                                   │ │
│ │          │ ├──────────────────────────────────────────────────────┤ │
│ │ ──────── │ │                                                      │ │
│ │ Dashboard│ │     ┌─────────────────────────────────────────┐     │ │
│ │ ──────── │ │     │         COMPOSITE SCORE                 │     │ │
│ │ New Loan │ │     │                                         │     │ │
│ │ Batch    │ │     │            ╭───────╮                    │     │ │
│ │ Reports  │ │     │           ╱   782   ╲                   │     │ │
│ │          │ │     │          │  ───────  │   🟢 APPROVED    │     │ │
│ │          │ │     │           ╲  /1000  ╱                   │     │ │
│ │          │ │     │            ╰───────╯                    │     │ │
│ │          │ │     │                                         │     │ │
│ │          │ │     └─────────────────────────────────────────┘     │ │
│ │          │ │                                                      │ │
│ │          │ │  Score Breakdown                                     │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ Credit Score (40%)        720/850              │ │ │
│ │          │ │  │ ████████████████████░░░░░░░░░░  339/400 pts   │ │ │
│ │          │ │  │ Source: MockCreditBureau                       │ │ │
│ │          │ │  ├────────────────────────────────────────────────┤ │ │
│ │          │ │  │ Income/Assets (30%)       DTI: 28%             │ │ │
│ │          │ │  │ ██████████████████████░░░░░░░░  243/300 pts   │ │ │
│ │          │ │  │ Source: Calculated from borrower data          │ │ │
│ │          │ │  ├────────────────────────────────────────────────┤ │ │
│ │          │ │  │ ESG Score (30%)           85/100               │ │ │
│ │          │ │  │ ██████████████████████████░░░░  200/300 pts   │ │ │
│ │          │ │  │ Source: MockESGProvider (Technology sector)    │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  ⏱️ Processing time: 1.2 seconds                    │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

Score Gauge: 200px diameter, animated arc fill
Progress Bars: 100% width, 24px height, rounded corners
Decision Badge: 120px × 40px, colored background
```


#### Screen 4: Decision & Loan Terms (1440x900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │  LOGO    │ │  Loan Decision                                       │ │
│ │          │ ├──────────────────────────────────────────────────────┤ │
│ │ ──────── │ │                                                      │ │
│ │ Dashboard│ │  ┌────────────────────────────────────────────────┐ │ │
│ │ ──────── │ │  │  🟢 LOAN APPROVED                              │ │ │
│ │ New Loan │ │  │  John Smith | Score: 782 | Tech Industry       │ │ │
│ │ Batch    │ │  └────────────────────────────────────────────────┘ │ │
│ │ Reports  │ │                                                      │ │
│ │          │ │  ┌─────────────────────┐ ┌─────────────────────────┐│ │
│ │          │ │  │ Loan Terms          │ │ PDF Preview             ││ │
│ │          │ │  │                     │ │ ┌─────────────────────┐ ││ │
│ │          │ │  │ Principal:          │ │ │ LOAN AGREEMENT      │ ││ │
│ │          │ │  │ $250,000            │ │ │                     │ ││ │
│ │          │ │  │                     │ │ │ Borrower: J. Smith  │ ││ │
│ │          │ │  │ Interest Rate:      │ │ │ Principal: $250,000 │ ││ │
│ │          │ │  │ 6.5% APR            │ │ │ Rate: 6.5% APR      │ ││ │
│ │          │ │  │                     │ │ │ Term: 360 months    │ ││ │
│ │          │ │  │ Term:               │ │ │ Payment: $1,580/mo  │ ││ │
│ │          │ │  │ 30 years (360 mo)   │ │ │                     │ ││ │
│ │          │ │  │                     │ │ │ Generated: 12/29/25 │ ││ │
│ │          │ │  │ Monthly Payment:    │ │ └─────────────────────┘ ││ │
│ │          │ │  │ $1,580.17           │ │                         ││ │
│ │          │ │  └─────────────────────┘ └─────────────────────────┘│ │
│ │          │ │                                                      │ │
│ │          │ │  Audit Trail                                         │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ 10:23:01 | Credit fetch | MockCreditBureau     │ │ │
│ │          │ │  │ 10:23:02 | ESG fetch    | MockESGProvider      │ │ │
│ │          │ │  │ 10:23:02 | Score calc   | CompositeEngine      │ │ │
│ │          │ │  │ 10:23:02 | Decision     | AUTO_APPROVED        │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  ┌──────────────┐  ┌──────────────┐                 │ │
│ │          │ │  │ 📄 Export PDF│  │ ➕ New Assess │                 │ │
│ │          │ │  └──────────────┘  └──────────────┘                 │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

Decision Banner: 100% width, 80px height, green/yellow/red gradient
Loan Terms Card: 300px width, white background
PDF Preview: 400px width, light gray background, document styling
Audit Trail: 100% width, monospace font, alternating row colors
```

#### Screen 5: Batch Processor (1440x900)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────────┐ │
│ │  LOGO    │ │  Batch Processing                                    │ │
│ │          │ ├──────────────────────────────────────────────────────┤ │
│ │ ──────── │ │                                                      │ │
│ │ Dashboard│ │  ┌────────────────────────────────────────────────┐ │ │
│ │ ──────── │ │  │  📁 Drop CSV file here or click to upload      │ │ │
│ │ New Loan │ │  │     Accepts: name, ssn, income, assets,        │ │ │
│ │ Batch    │ │  │              company, industry                 │ │ │
│ │ Reports  │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  Processing: loans_batch.csv (1000 rows)            │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ ████████████████████████░░░░░░░░░░  72%        │ │ │
│ │          │ │  │ Processing loan 720 of 1000...                 │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  Results                                             │ │
│ │          │ │  ┌────────────────────────────────────────────────┐ │ │
│ │          │ │  │ Borrower      │ Score │ Decision │ Time        │ │ │
│ │          │ │  ├───────────────┼───────┼──────────┼─────────────┤ │ │
│ │          │ │  │ Alice Brown   │  812  │ 🟢 APPR  │ 28ms        │ │ │
│ │          │ │  │ Bob Chen      │  678  │ 🟡 REV   │ 31ms        │ │ │
│ │          │ │  │ Carol Davis   │  543  │ 🔴 REJ   │ 29ms        │ │ │
│ │          │ │  │ ... (997 more rows)                            │ │ │
│ │          │ │  └────────────────────────────────────────────────┘ │ │
│ │          │ │                                                      │ │
│ │          │ │  Summary                                             │ │
│ │          │ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │ │
│ │          │ │  │Processed│ │Approved │ │ Review  │ │Rejected │   │ │
│ │          │ │  │  1000   │ │   700   │ │   200   │ │   100   │   │ │
│ │          │ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │ │
│ │          │ │                                                      │ │
│ │          │ │  ⚡ Efficiency: Manual 83hrs → AI 8.3hrs (90% ↓)    │ │
│ │          │ │                                                      │ │
│ │          │ │  ┌──────────────────┐                               │ │
│ │          │ │  │ 📥 Export Results │                               │ │
│ │          │ │  └──────────────────┘                               │ │
│ └──────────┘ └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

Dropzone: 100% width, 150px height, dashed border, hover highlight
Progress Bar: 100% width, 32px height, animated stripe pattern
Results Table: Virtualized for 1000+ rows, 40px row height
Summary Cards: 150px × 100px each, colored borders
```


## Data Models

### State Store Structure

```typescript
// Main application store using Zustand
interface AppStore {
  // Navigation
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  
  // Current assessment workflow
  currentAssessment: Assessment | null;
  startAssessment: (borrower: Borrower) => void;
  updateScoring: (scores: Partial<CompositeScore>) => void;
  completeAssessment: (terms?: LoanTerms) => void;
  clearAssessment: () => void;
  
  // Assessment history
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  
  // Batch processing
  currentBatch: BatchJob | null;
  startBatch: (file: File) => void;
  updateBatchProgress: (processed: number, result: BatchResult) => void;
  completeBatch: (summary: BatchSummary) => void;
  
  // Dashboard metrics
  metrics: DashboardMetrics;
  refreshMetrics: () => void;
}

type ScreenType = 'dashboard' | 'borrower-input' | 'scoring' | 'decision' | 'batch';

interface DashboardMetrics {
  todayAssessments: number;
  approvalRate: number;
  averageTimeSeconds: number;
  timeSavedPercent: number;
}
```

### Mock API Response Schemas

```typescript
// Credit Bureau API Response
interface CreditBureauResponse {
  success: boolean;
  data: {
    score: number;
    scoreDate: string;
    factors: {
      paymentHistory: number;
      creditUtilization: number;
      creditAge: number;
      creditMix: number;
      newCredit: number;
    };
    accounts: {
      total: number;
      delinquent: number;
      collections: number;
    };
  };
  requestId: string;
  latencyMs: number;
}

// ESG Provider API Response
interface ESGProviderResponse {
  success: boolean;
  data: {
    overallScore: number;
    breakdown: {
      environmental: number;
      social: number;
      governance: number;
    };
    industryRank: number;
    industryTotal: number;
    carbonFootprint: 'low' | 'medium' | 'high';
    complianceStatus: 'compliant' | 'warning' | 'violation';
  };
  requestId: string;
  latencyMs: number;
}
```

### Scoring Algorithm

```typescript
function calculateCompositeScore(
  creditScore: CreditScore,
  incomeAssets: IncomeAssetsScore,
  esgScore: ESGScore
): CompositeScore {
  // Normalize credit score (300-850) to 0-400 points
  const creditNormalized = ((creditScore.score - 300) / 550) * 400;
  
  // Normalize income/assets score (0-100) to 0-300 points
  const incomeNormalized = (incomeAssets.score / 100) * 300;
  
  // Normalize ESG score (0-100) to 0-300 points
  const esgNormalized = (esgScore.total / 100) * 300;
  
  const total = Math.round(creditNormalized + incomeNormalized + esgNormalized);
  
  // Determine decision based on thresholds
  let decision: LoanDecision;
  if (total > 750) {
    decision = 'APPROVED';
  } else if (total >= 600) {
    decision = 'REVIEW';
  } else {
    decision = 'REJECTED';
  }
  
  return {
    total,
    creditComponent: Math.round(creditNormalized),
    incomeComponent: Math.round(incomeNormalized),
    esgComponent: Math.round(esgNormalized),
    decision,
    processingTimeMs: 0 // Set by caller
  };
}

function calculateIncomeAssetsScore(
  annualIncome: number,
  totalAssets: number,
  estimatedDebt: number = 0
): IncomeAssetsScore {
  // Debt-to-income ratio (lower is better)
  const dti = estimatedDebt > 0 ? (estimatedDebt / annualIncome) * 100 : 25;
  
  // Asset coverage ratio (higher is better)
  const acr = totalAssets / Math.max(annualIncome, 1);
  
  // Score calculation (0-100)
  // DTI: 0-20% = 50pts, 20-35% = 35pts, 35-50% = 20pts, >50% = 10pts
  let dtiScore = dti <= 20 ? 50 : dti <= 35 ? 35 : dti <= 50 ? 20 : 10;
  
  // ACR: >5x = 50pts, 3-5x = 40pts, 1-3x = 25pts, <1x = 10pts
  let acrScore = acr > 5 ? 50 : acr > 3 ? 40 : acr > 1 ? 25 : 10;
  
  return {
    debtToIncomeRatio: Math.round(dti),
    assetCoverageRatio: Math.round(acr * 100) / 100,
    score: dtiScore + acrScore
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Composite Score Calculation Accuracy

*For any* valid credit score (300-850), income/assets score (0-100), and ESG score (0-100), the composite score calculation SHALL produce a total between 0-1000 where:
- Credit component = ((creditScore - 300) / 550) × 400
- Income component = (incomeScore / 100) × 300
- ESG component = (esgScore / 100) × 300
- Total = Credit + Income + ESG (rounded to integer)

**Validates: Requirements 3.2**

### Property 2: Decision Threshold Consistency

*For any* composite score value:
- Score > 750 → decision MUST be 'APPROVED'
- Score >= 600 AND Score <= 750 → decision MUST be 'REVIEW'
- Score < 600 → decision MUST be 'REJECTED'

The decision function must be deterministic and consistent across all invocations.

**Validates: Requirements 3.8, 3.9, 3.10**

### Property 3: Form Validation Correctness

*For any* form input:
- SSN matching pattern `^\d{3}-\d{2}-\d{4}$` → valid
- SSN not matching pattern → invalid
- Annual Income > 0 → valid
- Annual Income <= 0 → invalid
- Total Assets >= 0 → valid
- Total Assets < 0 → invalid
- All required fields non-empty AND valid → form valid, submit enabled
- Any required field empty OR invalid → form invalid, submit disabled

**Validates: Requirements 2.2, 2.3, 2.5, 2.7**

### Property 4: Mock API Response Validity

*For any* mock API call:
- Credit Bureau response score MUST be in range [300, 850]
- ESG Provider response score MUST be in range [0, 100]
- Simulated latency MUST be in range [500ms, 1500ms]

*For any* SSN value, repeated Credit Bureau calls MUST return identical scores (deterministic).

**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

### Property 5: Batch Processing Accuracy

*For any* completed batch job:
- results.length MUST equal totalRows
- summary.totalProcessed MUST equal results.length
- summary.approvedCount + summary.reviewCount + summary.rejectedCount + summary.errorCount MUST equal summary.totalProcessed
- Each result.decision MUST match the decision derived from result.compositeScore using Property 2 thresholds

**Validates: Requirements 5.5, 5.6**

### Property 6: Audit Trail Completeness

*For any* completed assessment:
- Audit trail MUST contain entry for credit score fetch with timestamp and source
- Audit trail MUST contain entry for ESG score fetch with timestamp and source
- Audit trail MUST contain entry for composite score calculation
- Audit trail MUST contain entry for final decision
- All timestamps MUST be in chronological order
- All entries MUST have non-empty dataSource field

**Validates: Requirements 4.4**

### Property 7: Loan Terms Generation for Approved Loans

*For any* assessment with decision 'APPROVED':
- loanTerms MUST be defined (not null/undefined)
- loanTerms.principalAmount MUST be > 0
- loanTerms.interestRate MUST be in range [0, 100]
- loanTerms.termMonths MUST be > 0
- loanTerms.monthlyPayment MUST equal calculated payment using standard amortization formula

*For any* assessment with decision 'REVIEW' or 'REJECTED':
- loanTerms MAY be undefined

**Validates: Requirements 4.2**

### Property 8: Dashboard Metrics Accuracy

*For any* set of assessments:
- todayAssessments MUST equal count of assessments where createdAt is today
- approvalRate MUST equal (approved count / total count) × 100
- averageTimeSeconds MUST equal sum(processingTimeMs) / count / 1000

**Validates: Requirements 1.4, 6.4**

## Error Handling

### Input Validation Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| Empty required field | "This field is required" | Highlight field, focus |
| Invalid SSN format | "Please enter SSN as XXX-XX-XXXX" | Show format hint |
| Negative income/assets | "Please enter a positive value" | Clear field |
| Invalid CSV format | "CSV must contain columns: name, ssn, income, assets, company, industry" | Show template download |
| CSV parse error | "Unable to parse CSV file. Please check format." | Show error row number |

### API Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| Credit Bureau timeout | "Unable to fetch credit data. Please retry." | Show retry button |
| ESG Provider timeout | "Unable to fetch ESG data. Please retry." | Show retry button |
| Network error | "Network connection error. Please check your connection." | Show retry button |

### Processing Errors

| Error Condition | User Message | Recovery Action |
|----------------|--------------|-----------------|
| Batch row error | "Error processing row X: [details]" | Continue processing, mark row as error |
| PDF generation error | "Unable to generate PDF. Please retry." | Show retry button |
| Export error | "Unable to export file. Please retry." | Show retry button |

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

1. **Form Validation Tests**
   - Valid SSN formats accepted
   - Invalid SSN formats rejected
   - Currency formatting works correctly
   - Required field validation triggers

2. **Score Calculation Tests**
   - Boundary values (300, 600, 750, 850, 1000)
   - Typical values produce expected results
   - Edge case: all minimum scores
   - Edge case: all maximum scores

3. **Decision Logic Tests**
   - Score 751 → APPROVED
   - Score 750 → REVIEW
   - Score 600 → REVIEW
   - Score 599 → REJECTED

4. **Batch Processing Tests**
   - Empty CSV handling
   - Single row CSV
   - Large CSV (1000+ rows)
   - Malformed row handling

### Property-Based Tests

Property-based tests use randomized inputs to verify universal properties. Each test runs minimum 100 iterations.

**Testing Framework**: fast-check (TypeScript property-based testing library)

**Test Configuration**:
```typescript
import fc from 'fast-check';

// Configure minimum 100 iterations per property
const propertyConfig = { numRuns: 100 };
```

**Property Test Annotations**:
- Each test tagged with: `Feature: loanai-assessor, Property N: [property text]`
- Each test references requirements it validates
