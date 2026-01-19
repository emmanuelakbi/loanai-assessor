import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BorrowerForm } from '../components/BorrowerInput/BorrowerForm';
import { useAppStore } from '../store/appStore';
import type { BorrowerFormData } from '../utils/validators';
import type { Borrower, IndustrySector } from '../types';

export const BorrowerInputScreen: React.FC = () => {
  const navigate = useNavigate();
  const { startAssessment } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BorrowerFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to fetch credit data
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate for demo
          if (Math.random() > 0.1) {
            resolve(data);
          } else {
            reject(new Error('Unable to fetch data. Please retry.'));
          }
        }, 1500);
      });

      // Create borrower object and save to store
      const borrower: Borrower = {
        id: crypto.randomUUID(),
        fullName: data.fullName,
        ssn: data.ssn,
        annualIncome: data.annualIncome,
        totalAssets: data.totalAssets,
        companyName: data.companyName,
        industrySector: data.industrySector as IndustrySector,
        createdAt: new Date(),
      };

      // Start assessment in store (saves borrower data)
      startAssessment(borrower);

      // Navigate to scoring screen on success
      navigate('/scoring');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch data. Please retry.');
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px',
    minHeight: '100%',
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1E3A8A',
    marginBottom: '24px',
    width: '600px',
  };

  const cardStyle: React.CSSProperties = {
    width: '600px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px',
  };

  const cardHeaderStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB',
  };

  const errorContainerStyle: React.CSSProperties = {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#DC2626',
    fontSize: '14px',
  };

  const retryButtonStyle: React.CSSProperties = {
    backgroundColor: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 200ms ease, transform 200ms ease',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>New Loan Assessment</h1>
      <div style={cardStyle}>
        <h2 style={cardHeaderStyle}>Borrower Information</h2>
        
        {error && (
          <div style={errorContainerStyle}>
            <span style={errorTextStyle}>{error}</span>
            <button 
              style={retryButtonStyle} 
              onClick={handleRetry}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-error rounded-md"
            >
              Retry
            </button>
          </div>
        )}

        <BorrowerForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};
