# Implementation Plan: Borrower Input Module

## Overview

Implementation tasks for the borrower data collection form with real-time validation.

## Tasks

- [ ] 1. Create Base Form Components
  - [ ] 1.1 Create TextInput component
    - Create `src/components/Form/TextInput.tsx`
    - Props: label, value, onChange, onBlur, error, required
    - Style: 48px height, #E5E7EB border, 8px radius
    - Error state: red border, error text below
    - _Requirements: 1.1, 1.4_

  - [ ] 1.2 Create SSNInput component
    - Create `src/components/Form/SSNInput.tsx`
    - Auto-mask format: XXX-XX-XXXX
    - Accept only digits, auto-insert dashes
    - Show last 4 digits only in display
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 1.3 Create CurrencyInput component
    - Create `src/components/Form/CurrencyInput.tsx`
    - Display $ prefix
    - Auto-format with comma separators
    - Parse to number on change
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 1.4 Create IndustrySelect component
    - Create `src/components/Form/IndustrySelect.tsx`
    - Dropdown with 8 industry options
    - Hover highlighting
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 2. Create Form Validation Logic
  - [ ] 2.1 Create validation utilities
    - Create `src/utils/validators.ts`
    - Implement validators for each field type
    - Export isFormValid function
    - _Requirements: 5.1, 5.4_

  - [ ] 2.2 Write property tests for SSN validation
    - **Property 1: SSN Format Validation**
    - Test valid 9-digit inputs pass
    - Test invalid lengths fail
    - Test non-numeric inputs fail
    - **Validates: Requirements 2.4**

  - [ ] 2.3 Write property tests for form state
    - **Property 3: Form State Consistency**
    - Test button enabled when all valid
    - Test button disabled when any invalid
    - **Validates: Requirements 5.2, 5.3**

- [ ] 3. Create BorrowerForm Component
  - [ ] 3.1 Create BorrowerForm with all fields
    - Create `src/components/BorrowerInput/BorrowerForm.tsx`
    - Compose all input components
    - Manage form state with useState
    - _Requirements: 1.2, 1.3_

  - [ ] 3.2 Implement real-time validation
    - Validate on blur for each field
    - Update error state
    - Control button enabled state
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Create BorrowerInputScreen
  - [ ] 4.1 Create screen with form card
    - Create `src/screens/BorrowerInputScreen.tsx`
    - Center form card at 600px width
    - Add header "New Loan Assessment"
    - _Requirements: 1.1_

  - [ ] 4.2 Implement submit flow
    - Show loading spinner on submit
    - Display "Fetching credit data..." message
    - Navigate to /scoring on success
    - Show error with retry on failure
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5. Checkpoint - Borrower Input Complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required
- Property tests use fast-check library
- Form state managed locally, passed to store on submit
