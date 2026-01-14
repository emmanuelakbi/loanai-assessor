# Requirements Document: Borrower Input Module

## Introduction

The Borrower Input Module handles collection and validation of borrower information through a structured form interface. This is the entry point for single loan assessments in the LoanAI Assessor system.

## Glossary

- **Borrower_Input_Module**: Component handling borrower data collection forms
- **TextInput**: Standard text field component with validation
- **SSNInput**: Masked Social Security Number input field
- **CurrencyInput**: Formatted currency input with validation
- **IndustrySelect**: Dropdown selector for industry sectors
- **FetchDataButton**: Submit button that triggers API scoring

## Requirements

### Requirement 1: Form Field Display

**User Story:** As a loan officer, I want a structured form with all required borrower fields, so that I can collect complete information for assessment.

#### Acceptance Criteria

1. WHEN a user navigates to New Assessment, THE Borrower_Input_Module SHALL display a form card centered at 600px width
2. THE Borrower_Input_Module SHALL display fields: Full Name, SSN, Annual Income, Total Assets, Company Name, Industry Sector
3. THE Borrower_Input_Module SHALL mark all fields as required with asterisk indicators
4. THE Borrower_Input_Module SHALL use 48px height inputs with 16px font size

### Requirement 2: SSN Input Masking

**User Story:** As a loan officer, I want SSN to be masked for privacy, so that sensitive data is protected during entry.

#### Acceptance Criteria

1. THE SSNInput SHALL display format as XXX-XX-XXXX with last 4 digits visible
2. WHEN a user types digits, THE SSNInput SHALL auto-insert dashes at positions 3 and 5
3. THE SSNInput SHALL accept only numeric input (0-9)
4. IF SSN is not exactly 9 digits, THEN THE SSNInput SHALL display validation error

### Requirement 3: Currency Input Formatting

**User Story:** As a loan officer, I want currency fields to auto-format, so that I can quickly enter financial values.

#### Acceptance Criteria

1. THE CurrencyInput SHALL display $ prefix
2. WHEN a user types numbers, THE CurrencyInput SHALL auto-format with comma separators
3. THE CurrencyInput SHALL accept only positive numeric values
4. IF value is zero or negative, THEN THE CurrencyInput SHALL display validation error

### Requirement 4: Industry Sector Selection

**User Story:** As a loan officer, I want to select from predefined industries, so that ESG scoring can be applied correctly.

#### Acceptance Criteria

1. THE IndustrySelect SHALL provide dropdown with 8 options: Technology, Healthcare, Manufacturing, Finance, Energy, Retail, Agriculture, Construction
2. WHEN dropdown is open, THE IndustrySelect SHALL highlight hovered option
3. THE IndustrySelect SHALL display selected value in the input field

### Requirement 5: Form Validation

**User Story:** As a loan officer, I want real-time validation feedback, so that I can correct errors before submission.

#### Acceptance Criteria

1. WHEN a field loses focus with invalid value, THE Borrower_Input_Module SHALL display inline error message
2. WHEN all fields are valid, THE FetchDataButton SHALL be enabled with #1E3A8A background
3. IF any field is invalid or empty, THEN THE FetchDataButton SHALL be disabled with #9CA3AF background
4. THE Borrower_Input_Module SHALL validate on blur and on submit attempt

### Requirement 6: Data Submission

**User Story:** As a loan officer, I want to submit borrower data for scoring, so that I can proceed with the assessment.

#### Acceptance Criteria

1. WHEN user clicks FetchDataButton, THE Borrower_Input_Module SHALL display loading spinner
2. WHEN user clicks FetchDataButton, THE Borrower_Input_Module SHALL show "Fetching credit data..." message
3. WHEN data fetch completes, THE Borrower_Input_Module SHALL navigate to API Scoring screen
4. IF data fetch fails, THEN THE Borrower_Input_Module SHALL display error message with retry option
