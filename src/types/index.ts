// Industry sector options
export type IndustrySector =
  | 'Technology'
  | 'Healthcare'
  | 'Manufacturing'
  | 'Finance'
  | 'Energy'
  | 'Retail'
  | 'Agriculture'
  | 'Construction';

// Borrower data model
export interface Borrower {
  id: string;
  fullName: string;
  ssn: string; // Stored masked: XXX-XX-1234
  annualIncome: number;
  totalAssets: number;
  companyName: string;
  industrySector: IndustrySector;
  createdAt: Date;
}

// Credit history details
export interface CreditHistory {
  accountAge: number; // years
  onTimePayments: number; // percentage
  creditUtilization: number; // percentage
  derogatoriesCount: number;
}

// Credit score from bureau
export interface CreditScore {
  score: number; // 300-850
  maxScore: 850;
  history: CreditHistory;
  source: 'MockCreditBureau';
  fetchedAt: Date;
}


// ESG score from provider
export interface ESGScore {
  total: number; // 0-100
  environmental: number;
  social: number;
  governance: number;
  industryBenchmark: number;
  source: 'MockESGProvider';
  fetchedAt: Date;
}

// Income and assets score calculation
export interface IncomeAssetsScore {
  debtToIncomeRatio: number; // percentage
  assetCoverageRatio: number;
  score: number; // normalized 0-100
}

// Loan decision types
export type LoanDecision = 'APPROVED' | 'REVIEW' | 'REJECTED';

// Composite score combining all factors
export interface CompositeScore {
  total: number; // 0-1000
  creditComponent: number; // 40% weight, max 400
  incomeComponent: number; // 30% weight, max 300
  esgComponent: number; // 30% weight, max 300
  decision: LoanDecision;
  processingTimeMs: number;
}

// Loan terms for approved loans
export interface LoanTerms {
  principalAmount: number;
  interestRate: number; // annual percentage
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  generatedAt: Date;
}

// Audit trail entry
export interface AuditEntry {
  timestamp: Date;
  action: string;
  dataSource: string;
  details: Record<string, unknown>;
}


// Assessment status
export type AssessmentStatus = 'pending' | 'scoring' | 'complete';

// Complete assessment record
export interface Assessment {
  id: string;
  borrower: Borrower;
  creditScore: CreditScore;
  esgScore: ESGScore;
  incomeAssetsScore: IncomeAssetsScore;
  compositeScore: CompositeScore;
  loanTerms?: LoanTerms;
  auditTrail: AuditEntry[];
  status: AssessmentStatus;
  createdAt: Date;
  completedAt?: Date;
}

// Batch job status
export type BatchJobStatus =
  | 'uploading'
  | 'validating'
  | 'processing'
  | 'complete'
  | 'error';

// Individual batch result
export interface BatchResult {
  rowIndex: number;
  borrowerName: string;
  compositeScore: number;
  decision: LoanDecision;
  processingTimeMs: number;
  error?: string;
}

// Batch summary statistics
export interface BatchSummary {
  totalProcessed: number;
  approvedCount: number;
  reviewCount: number;
  rejectedCount: number;
  errorCount: number;
  totalTimeMs: number;
  averageTimeMs: number;
}

// Batch processing job
export interface BatchJob {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  results: BatchResult[];
  status: BatchJobStatus;
  startedAt: Date;
  completedAt?: Date;
  summary?: BatchSummary;
}

// Screen types for navigation
export type ScreenType =
  | 'dashboard'
  | 'borrower-input'
  | 'scoring'
  | 'decision'
  | 'batch';

// Dashboard metrics
export interface DashboardMetrics {
  todayAssessments: number;
  approvalRate: number;
  averageTimeSeconds: number;
  timeSavedPercent: number;
}
