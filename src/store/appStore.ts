import { create } from 'zustand';
import type {
  Assessment,
  BatchJob,
  BatchResult,
  BatchSummary,
  Borrower,
  CompositeScore,
  DashboardMetrics,
  LoanTerms,
  ScreenType,
} from '../types';

// App store interface
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
  clearBatch: () => void;

  // Dashboard metrics
  metrics: DashboardMetrics;
  refreshMetrics: () => void;
}


// Helper to generate unique IDs
const generateId = () => crypto.randomUUID();

// Helper to check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Calculate dashboard metrics from assessments
const calculateMetrics = (assessments: Assessment[]): DashboardMetrics => {
  const todayAssessments = assessments.filter((a) => isToday(a.createdAt));
  const completedToday = todayAssessments.filter((a) => a.status === 'complete');

  const approvedCount = completedToday.filter(
    (a) => a.compositeScore?.decision === 'APPROVED'
  ).length;

  const totalTimeMs = completedToday.reduce(
    (sum, a) => sum + (a.compositeScore?.processingTimeMs || 0),
    0
  );

  return {
    todayAssessments: todayAssessments.length,
    approvalRate:
      completedToday.length > 0
        ? (approvedCount / completedToday.length) * 100
        : 0,
    averageTimeSeconds:
      completedToday.length > 0
        ? totalTimeMs / completedToday.length / 1000
        : 0,
    timeSavedPercent: 94, // Fixed: 30s vs 5min = 94% savings
  };
};


// Create the Zustand store
export const useAppStore = create<AppStore>((set, get) => ({
  // Navigation state
  currentScreen: 'dashboard',
  setScreen: (screen) => set({ currentScreen: screen }),

  // Current assessment workflow
  currentAssessment: null,

  startAssessment: (borrower) => {
    const assessment: Assessment = {
      id: generateId(),
      borrower,
      creditScore: null as unknown as Assessment['creditScore'],
      esgScore: null as unknown as Assessment['esgScore'],
      incomeAssetsScore: null as unknown as Assessment['incomeAssetsScore'],
      compositeScore: null as unknown as Assessment['compositeScore'],
      auditTrail: [
        {
          timestamp: new Date(),
          action: 'Assessment Started',
          dataSource: 'User Input',
          details: { borrowerName: borrower.fullName },
        },
      ],
      status: 'pending',
      createdAt: new Date(),
    };
    set({ currentAssessment: assessment });
  },

  updateScoring: (scores) => {
    const { currentAssessment } = get();
    if (!currentAssessment) return;

    set({
      currentAssessment: {
        ...currentAssessment,
        compositeScore: {
          ...currentAssessment.compositeScore,
          ...scores,
        } as Assessment['compositeScore'],
        status: 'scoring',
      },
    });
  },

  completeAssessment: (terms) => {
    const { currentAssessment, assessments } = get();
    if (!currentAssessment) return;

    const completedAssessment: Assessment = {
      ...currentAssessment,
      loanTerms: terms,
      status: 'complete',
      completedAt: new Date(),
      auditTrail: [
        ...currentAssessment.auditTrail,
        {
          timestamp: new Date(),
          action: 'Assessment Completed',
          dataSource: 'Decision Engine',
          details: { decision: currentAssessment.compositeScore?.decision },
        },
      ],
    };

    set({
      currentAssessment: completedAssessment,
      assessments: [completedAssessment, ...assessments],
    });
  },

  clearAssessment: () => set({ currentAssessment: null }),

  // Assessment history
  assessments: [],
  addAssessment: (assessment) =>
    set((state) => ({ assessments: [assessment, ...state.assessments] })),


  // Batch processing
  currentBatch: null,

  startBatch: (file) => {
    const batch: BatchJob = {
      id: generateId(),
      fileName: file.name,
      totalRows: 0,
      processedRows: 0,
      results: [],
      status: 'uploading',
      startedAt: new Date(),
    };
    set({ currentBatch: batch });
  },

  updateBatchProgress: (processed, result) => {
    const { currentBatch } = get();
    if (!currentBatch) return;

    set({
      currentBatch: {
        ...currentBatch,
        processedRows: processed,
        results: [...currentBatch.results, result],
        status: 'processing',
      },
    });
  },

  completeBatch: (summary) => {
    const { currentBatch } = get();
    if (!currentBatch) return;

    set({
      currentBatch: {
        ...currentBatch,
        status: 'complete',
        completedAt: new Date(),
        summary,
      },
    });
  },

  clearBatch: () => set({ currentBatch: null }),

  // Dashboard metrics
  metrics: {
    todayAssessments: 0,
    approvalRate: 0,
    averageTimeSeconds: 0,
    timeSavedPercent: 94,
  },

  refreshMetrics: () => {
    const { assessments } = get();
    set({ metrics: calculateMetrics(assessments) });
  },
}));
