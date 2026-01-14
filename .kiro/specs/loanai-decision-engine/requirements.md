# Requirements Document: Decision Engine Module

## Introduction

The Decision Engine Module displays final loan decisions, generates loan terms for approved applications, provides PDF export, and maintains audit trails for compliance.

## Glossary

- **Decision_Engine**: Component that renders final decisions and generates loan terms
- **LoanTerms**: Generated loan parameters (principal, rate, term, payment)
- **AuditTrail**: Complete record of all data sources and decision factors
- **PDFPreview**: Visual preview of the loan agreement document

## Requirements

### Requirement 1: Decision Display

**User Story:** As a loan officer, I want to see the final decision prominently.

#### Acceptance Criteria

1. WHEN the Decision screen loads, THE Decision_Engine SHALL display a decision banner at full width
2. THE DecisionBanner SHALL show: "LOAN APPROVED", "MANUAL REVIEW REQUIRED", or "LOAN REJECTED"
3. THE DecisionBanner SHALL use color: green (#10B981) approved, yellow (#F59E0B) review, red (#EF4444) rejected
4. THE DecisionBanner SHALL display borrower name, score, and industry

### Requirement 2: Loan Terms Generation

**User Story:** As a loan officer, I want auto-generated loan terms for approved loans.

#### Acceptance Criteria

1. IF decision is APPROVED, THEN THE Decision_Engine SHALL generate loan terms
2. THE LoanTerms SHALL include: principal amount, interest rate, term length, monthly payment
3. THE Decision_Engine SHALL calculate principal based on income multiplier (2.0-3.0x)
4. THE Decision_Engine SHALL calculate interest rate based on risk (5.0% base + premium)
5. THE Decision_Engine SHALL calculate monthly payment using amortization formula

### Requirement 3: PDF Preview and Export

**User Story:** As a loan officer, I want to preview and export the loan agreement.

#### Acceptance Criteria

1. THE Decision_Engine SHALL display a PDF preview showing loan terms
2. THE PDFPreview SHALL include: borrower info, loan terms, credit assessment, date
3. WHEN user clicks "Export PDF", THE Decision_Engine SHALL download the document

### Requirement 4: Audit Trail

**User Story:** As a compliance officer, I want a complete audit trail.

#### Acceptance Criteria

1. THE Decision_Engine SHALL display audit trail with timestamped entries
2. THE AuditTrail SHALL include: credit fetch, ESG fetch, score calculation, decision
3. EACH audit entry SHALL show: timestamp, action, data source
4. THE AuditTrail SHALL display entries in chronological order

### Requirement 5: Navigation Actions

**User Story:** As a loan officer, I want to start a new assessment or export.

#### Acceptance Criteria

1. THE Decision_Engine SHALL display "Export PDF" and "New Assessment" buttons
2. WHEN user clicks "New Assessment", THE system SHALL navigate to borrower input
3. THE Decision_Engine SHALL display processing time comparison (AI vs Manual)
