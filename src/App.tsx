import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';

// Placeholder screen components - will be implemented in later tasks
const DashboardScreen = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
    <p className="mt-4 text-gray-600">Dashboard screen placeholder</p>
  </div>
);

const BorrowerInputScreen = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-primary">New Assessment</h1>
    <p className="mt-4 text-gray-600">Borrower input screen placeholder</p>
  </div>
);

const APIScoringScreen = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-primary">Credit Assessment</h1>
    <p className="mt-4 text-gray-600">API scoring screen placeholder</p>
  </div>
);

const DecisionScreen = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-primary">Loan Decision</h1>
    <p className="mt-4 text-gray-600">Decision screen placeholder</p>
  </div>
);

const BatchProcessorScreen = () => (
  <div className="p-8">
    <h1 className="text-2xl font-semibold text-primary">Batch Processing</h1>
    <p className="mt-4 text-gray-600">Batch processor screen placeholder</p>
  </div>
);

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
          <Route path="/decision" element={<DecisionScreen />} />

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
