# Design Document: Borrower Input Module

## Overview

The Borrower Input Module provides a form-based interface for collecting borrower information. It validates input in real-time and triggers the loan assessment workflow upon submission.

## Architecture

```
BorrowerInputScreen
├── FormCard (600px centered)
│   ├── FormHeader ("Borrower Information")
│   ├── TextInput (Full Name)
│   ├── FormRow
│   │   ├── SSNInput
│   │   └── CurrencyInput (Annual Income)
│   ├── FormRow
│   │   ├── CurrencyInput (Total Assets)
│   │   └── TextInput (Company Name)
│   ├── IndustrySelect
│   └── FetchDataButton
└── LoadingOverlay (conditional)
```

## Components and Interfaces

```typescript
interface BorrowerFormData {
  fullName: string;
  ssn: string;
  annualIncome: number;
  totalAssets: number;
  companyName: string;
  industrySector: IndustrySector;
}

interface ValidationErrors {
  fullName?: string;
  ssn?: string;
  annualIncome?: string;
  totalAssets?: string;
  companyName?: string;
  industrySector?: string;
}

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}

interface SSNInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}

interface IndustrySelectProps {
  value: IndustrySector | '';
  onChange: (value: IndustrySector) => void;
  error?: string;
}
```

## Screen Layout (1440x900)

```
┌─────────────────────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content (1200px)                      │
│                   │                                              │
│  [Logo]           │  ┌─────────────────────────────────────┐    │
│                   │  │  New Loan Assessment                │    │
│  ○ Dashboard      │  │                                     │    │
│  ● New Assessment │  │  Borrower Information               │    │
│  ○ Batch Process  │  │  ─────────────────────────────────  │    │
│  ○ Reports        │  │                                     │    │
│                   │  │  Full Name *                        │    │
│                   │  │  [________________________]         │    │
│                   │  │                                     │    │
│                   │  │  SSN *              Annual Income * │    │
│                   │  │  [XXX-XX-____]      [$___,___]      │    │
│                   │  │                                     │    │
│                   │  │  Total Assets *     Company Name *  │    │
│                   │  │  [$___,___]         [____________]  │    │
│                   │  │                                     │    │
│                   │  │  Industry Sector *                  │    │
│                   │  │  [Select industry...        ▼]      │    │
│                   │  │                                     │    │
│                   │  │  [      🔍 Fetch Data      ]        │    │
│                   │  │                                     │    │
│                   │  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### Validation Functions

```typescript
const validators = {
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
  }
};

function isFormValid(data: BorrowerFormData, errors: ValidationErrors): boolean {
  return Object.values(errors).every(e => !e) &&
         data.fullName && data.ssn && data.annualIncome > 0 &&
         data.companyName && data.industrySector;
}
```

## Correctness Properties

### Property 1: SSN Format Validation

*For any* string input to SSNInput, the validation SHALL return valid only if the input contains exactly 9 digits (ignoring dashes and spaces).

**Validates: Requirements 2.4**

### Property 2: Currency Validation

*For any* numeric input to CurrencyInput for Annual Income, the validation SHALL return valid only if the value is greater than 0.

**Validates: Requirements 3.4**

### Property 3: Form State Consistency

*For any* form state, the FetchDataButton SHALL be enabled if and only if all validation functions return undefined for their respective fields.

**Validates: Requirements 5.2, 5.3**

## Error Handling

| Error | Message | Recovery |
|-------|---------|----------|
| Empty required field | "{Field} is required" | Focus field |
| Invalid SSN | "SSN must be 9 digits" | Show format hint |
| Invalid income | "Annual income must be positive" | Clear and refocus |
| API failure | "Unable to fetch data. Please retry." | Show retry button |

## Testing Strategy

- Unit tests for each validator function
- Property tests for SSN format validation
- Property tests for form state consistency
- Integration test for submit flow
