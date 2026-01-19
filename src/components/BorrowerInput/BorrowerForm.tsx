import React, { useState } from 'react';
import { TextInput } from '../Form/TextInput';
import { SSNInput } from '../Form/SSNInput';
import { CurrencyInput } from '../Form/CurrencyInput';
import { IndustrySelect } from '../Form/IndustrySelect';
import {
  type BorrowerFormData,
  type ValidationErrors,
  validators,
  isFormValid,
} from '../../utils/validators';
import type { IndustrySector } from '../../types';

interface BorrowerFormProps {
  onSubmit: (data: BorrowerFormData) => void;
  isLoading?: boolean;
}

export const BorrowerForm: React.FC<BorrowerFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<BorrowerFormData>({
    fullName: '',
    ssn: '',
    annualIncome: 0,
    totalAssets: 0,
    companyName: '',
    industrySector: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Track which fields have been touched (blurred)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validate individual field on blur
  const handleBlur = (fieldName: keyof BorrowerFormData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    // Run validation for this field
    let error: string | undefined;
    switch (fieldName) {
      case 'fullName':
        error = validators.fullName(formData.fullName);
        break;
      case 'ssn':
        error = validators.ssn(formData.ssn);
        break;
      case 'annualIncome':
        error = validators.annualIncome(formData.annualIncome);
        break;
      case 'totalAssets':
        error = validators.totalAssets(formData.totalAssets);
        break;
      case 'companyName':
        error = validators.companyName(formData.companyName);
        break;
      case 'industrySector':
        error = validators.industrySector(formData.industrySector);
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    // Validate all fields
    const fullName = validators.fullName(formData.fullName);
    const ssn = validators.ssn(formData.ssn);
    const annualIncome = validators.annualIncome(formData.annualIncome);
    const totalAssets = validators.totalAssets(formData.totalAssets);
    const companyName = validators.companyName(formData.companyName);
    const industrySector = validators.industrySector(formData.industrySector);

    const newErrors: ValidationErrors = {
      fullName,
      ssn,
      annualIncome,
      totalAssets,
      companyName,
      industrySector,
    };

    setErrors(newErrors);

    // Only submit if form is valid
    if (isFormValid(formData, newErrors)) {
      onSubmit(formData);
    }
  };

  // Check if button should be enabled
  const isButtonEnabled = isFormValid(formData, errors) && !isLoading;

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  };

  const buttonStyle: React.CSSProperties = {
    height: '48px',
    backgroundColor: isButtonEnabled ? '#1E3A8A' : '#9CA3AF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: isButtonEnabled ? 'pointer' : 'not-allowed',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color 200ms ease, transform 200ms ease, box-shadow 200ms ease',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <TextInput
        label="Full Name"
        value={formData.fullName}
        onChange={(value) => setFormData({ ...formData, fullName: value })}
        onBlur={() => handleBlur('fullName')}
        error={touched.fullName ? errors.fullName : undefined}
        required
      />

      <div style={rowStyle}>
        <SSNInput
          value={formData.ssn}
          onChange={(value) => setFormData({ ...formData, ssn: value })}
          onBlur={() => handleBlur('ssn')}
          error={touched.ssn ? errors.ssn : undefined}
        />

        <CurrencyInput
          label="Annual Income"
          value={formData.annualIncome}
          onChange={(value) =>
            setFormData({ ...formData, annualIncome: value })
          }
          onBlur={() => handleBlur('annualIncome')}
          error={touched.annualIncome ? errors.annualIncome : undefined}
          required
        />
      </div>

      <div style={rowStyle}>
        <CurrencyInput
          label="Total Assets"
          value={formData.totalAssets}
          onChange={(value) => setFormData({ ...formData, totalAssets: value })}
          onBlur={() => handleBlur('totalAssets')}
          error={touched.totalAssets ? errors.totalAssets : undefined}
          required
        />

        <TextInput
          label="Company Name"
          value={formData.companyName}
          onChange={(value) => setFormData({ ...formData, companyName: value })}
          onBlur={() => handleBlur('companyName')}
          error={touched.companyName ? errors.companyName : undefined}
          required
        />
      </div>

      <IndustrySelect
        value={formData.industrySector}
        onChange={(value: IndustrySector) =>
          setFormData({ ...formData, industrySector: value })
        }
        onBlur={() => handleBlur('industrySector')}
        error={touched.industrySector ? errors.industrySector : undefined}
      />

      <button 
        type="submit" 
        style={buttonStyle} 
        disabled={!isButtonEnabled}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {isLoading ? (
          <>
            <span style={spinnerStyle} data-testid="loading-spinner" />
            <span>Fetching credit data...</span>
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>Fetch Data</span>
          </>
        )}
      </button>
    </form>
  );
};
