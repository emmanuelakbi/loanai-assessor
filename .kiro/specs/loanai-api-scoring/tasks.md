# Implementation Plan: API Scoring Module

## Overview

Implementation tasks for the scoring engine, mock APIs, and score visualization components.

## Tasks

- [x] 1. Create Mock API Services
  - [x] 1.1 Implement Credit Bureau mock API
    - Create `src/services/mockCreditBureau.ts`
    - Hash SSN for deterministic scores (300-850)
    - Simulate 500-1500ms latency
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 1.2 Implement ESG Provider mock API
    - Create `src/services/mockESGProvider.ts`
    - Industry-specific scores (0-100)
    - Simulate 500-1500ms latency
    - _Requirements: 5.2, 5.3, 5.5_

  - [x] 1.3 Write property tests for mock API validity
    - **Property 3: Mock API Response Validity**
    - **Validates: Requirements 5.1, 5.2, 5.4, 5.5**

- [ ] 2. Create Scoring Engine
  - [ ] 2.1 Implement composite score calculation
    - Create `src/services/scoringEngine.ts`
    - Weighted formula (40/30/30)
    - _Requirements: 2.1-2.5_

  - [ ] 2.2 Implement decision threshold logic
    - _Requirements: 4.1-4.4_

  - [ ] 2.3 Write property tests for score calculation
    - **Property 1: Composite Score Calculation Accuracy**
    - **Validates: Requirements 2.1-2.5**

  - [ ] 2.4 Write property tests for decision thresholds
    - **Property 2: Decision Threshold Consistency**
    - **Validates: Requirements 4.1-4.4**

- [ ] 3. Create Score Visualization Components
  - [ ] 3.1 Create CompositeScoreGauge component
    - SVG arc gauge, animated fill
    - _Requirements: 1.1-1.4_

  - [ ] 3.2 Create ScoreBreakdown component
    - Three progress bars with labels
    - _Requirements: 3.1-3.4_

  - [ ] 3.3 Create DecisionIndicator component
    - _Requirements: 4.1-4.3_

- [ ] 4. Create APIScoringScreen
  - [ ] 4.1 Create screen with data fetching
    - _Requirements: 1.1, 3.1_

  - [ ] 4.2 Implement auto-navigation (2s delay)
    - _Requirements: 6.1-6.3_

- [ ] 5. Checkpoint
  - Ensure all tests pass.

## Notes
- All tasks required
- Property tests use fast-check
