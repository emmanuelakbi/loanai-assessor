import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardScreen } from './screens/DashboardScreen';
import { BorrowerInputScreen } from './screens/BorrowerInputScreen';
import { APIScoringScreen } from './screens/APIScoringScreen';
import { DecisionScreen } from './screens/DecisionScreen';
import { BatchProcessorScreen } from './screens/BatchProcessorScreen';
import { useAppStore } from './store/appStore';

/**
 * DecisionScreenWrapper - Connects DecisionScreen to the store and router
 * 
 * Requirements:
 * - 4.6: WHEN a user clicks "New Assessment", THE LoanAI_System SHALL navigate back to the Borrower Input screen
 */
const DecisionScreenWrapper = () => {
  const navigate = useNavigate();
  const { currentAssessment, clearAssessment } = useAppStore();

  const handleNewAssessment = () => {
    clearAssessment();
    navigate('/new');
  };

  // If no assessment data, redirect to new assessment
  if (!currentAssessment || !currentAssessment.compositeScore) {
    return <Navigate to="/new" replace />;
  }

  return (
    <DecisionScreen
      assessment={currentAssessment}
      onNewAssessment={handleNewAssessment}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Dashboard - home route */}
          <Route path="/" element={<DashboardScreen />} />

          {/* New Assessment - borrower input */}
          <Route path="/new" element={<BorrowerInputScreen />} />

          {/* API Scoring visualization */}
          <Route path="/scoring" element={<APIScoringScreen />} />

          {/* Decision and loan terms */}
          <Route path="/decision" element={<DecisionScreenWrapper />} />

          {/* Batch processing */}
          <Route path="/batch" element={<BatchProcessorScreen />} />

          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
