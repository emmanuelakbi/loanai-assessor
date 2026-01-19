import type { IndustrySector } from '../types';

/**
 * Borrower form data structure for validation
 */
export interface BorrowerFormData {
  fullName: string;
  ssn: string;
  annualIncome: number;
  totalAssets: number;
  companyName: string;
  industrySector: IndustrySector | '';
}

/**
 * Validation errors for each form field
 */
export interface ValidationErrors {
  fullName?: string;
  ssn?: string;
  annualIncome?: string;
  totalAssets?: string;
  companyName?: string;
  industrySector?: string;
}

/**
 * Validators for each field type
 */
export const validators = {
  fullName: (value: string): string | undefined => {
    if (!value.trim()) return 'Full name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  },

  ssn: (value: string): string | undefined => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'SSN is required';
    if (digits.length !== 9) return 'SSN must be 9 digits';
    return undefined;
  },

  annualIncome: (value: number): string | undefined => {
    if (!value || value <= 0) return 'Annual income must be positive';
    return undefined;
  },

  totalAssets: (value: number): string | undefined => {
    if (value < 0) return 'Total assets cannot be negative';
    return undefined;
  },

  companyName: (value: string): string | undefined => {
    if (!value.trim()) return 'Company name is required';
    if (value.trim().length < 2) return 'Company name must be at least 2 characters';
    return undefined;
  },

  industrySector: (value: string): string | undefined => {
    if (!value) return 'Industry sector is required';
    return undefined;
  },
};

/**
 * Validates all form fields and returns validation errors
 */
export function validateForm(data: BorrowerFormData): ValidationErrors {
  return {
    fullName: validators.fullName(data.fullName),
    ssn: validators.ssn(data.ssn),
    annualIncome: validators.annualIncome(data.annualIncome),
    totalAssets: validators.totalAssets(data.totalAssets),
    companyName: validators.companyName(data.companyName),
    industrySector: validators.industrySector(data.industrySector),
  };
}

/**
 * Checks if the form is valid based on form data and validation errors
 * Returns true if and only if all validation functions return undefined
 */
export function isFormValid(data: BorrowerFormData, errors: ValidationErrors): boolean {
  // All errors must be undefined (no validation errors)
  const noErrors = Object.values(errors).every((e) => !e);

  // All required fields must have valid values
  const hasRequiredFields =
    data.fullName.trim().length > 0 &&
    data.ssn.replace(/\D/g, '').length === 9 &&
    data.annualIncome > 0 &&
    data.companyName.trim().length > 0 &&
    data.industrySector !== '';

  return noErrors && hasRequiredFields;
}
