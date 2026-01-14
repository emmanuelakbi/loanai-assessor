# Requirements Document: API Scoring Module

## Introduction

The API Scoring Module fetches credit and ESG data from mock APIs, calculates a weighted composite score, and displays results with visual breakdowns. This is the core scoring engine of LoanAI Assessor.

## Glossary

- **API_Scoring_Engine**: Component that calculates composite credit scores
- **Credit_Bureau_API**: Mock external service providing credit history data (300-850 range)
- **ESG_Data_Provider**: Mock external service providing ESG scores (0-100 range)
- **Composite_Score**: Weighted score (0-1000) combining Credit, Income/Assets, and ESG factors
- **CompositeScoreGauge**: Visual arc gauge displaying the total score
- **ScoreBreakdown**: Component showing individual score components

## Requirements

### Requirement 1: Composite Score Display

**User Story:** As a loan officer, I want to see a visual composite score, so that I can quickly understand the assessment result.

#### Acceptance Criteria

1. WHEN the API Scoring screen loads, THE API_Scoring_Engine SHALL display a composite score gauge (0-1000 scale)
2. THE CompositeScoreGauge SHALL animate from 0 to final score over 1.5 seconds
3. THE CompositeScoreGauge SHALL display the numeric score in the center (48px bold)
4. THE CompositeScoreGauge SHALL use color based on decision: green (>750), yellow (600-750), red (<600)

### Requirement 2: Weighted Score Calculation

**User Story:** As a loan officer, I want scores calculated with proper weighting, so that the assessment reflects multiple risk factors.

#### Acceptance Criteria

1. THE API_Scoring_Engine SHALL calculate composite score using: Credit (40%), Income/Assets (30%), ESG (30%)
2. THE API_Scoring_Engine SHALL normalize credit score (300-850) to 0-400 points
3. THE API_Scoring_Engine SHALL normalize income/assets score (0-100) to 0-300 points
4. THE API_Scoring_Engine SHALL normalize ESG score (0-100) to 0-300 points
5. THE API_Scoring_Engine SHALL round final composite score to integer

### Requirement 3: Score Breakdown Display

**User Story:** As a loan officer, I want to see individual score components, so that I can understand what factors influenced the decision.

#### Acceptance Criteria

1. THE ScoreBreakdown SHALL display three progress bars: Credit, Income/Assets, ESG
2. THE ScoreBreakdown SHALL show raw score and weighted contribution for each component
3. THE ScoreBreakdown SHALL animate progress bars from 0 to final width over 1 second
4. THE ScoreBreakdown SHALL display data source attribution for each component

### Requirement 4: Decision Thresholds

**User Story:** As a loan officer, I want automatic decision classification, so that I know the recommended action.

#### Acceptance Criteria

1. WHEN composite score exceeds 750, THE API_Scoring_Engine SHALL classify as APPROVED (🟢)
2. WHEN composite score is 600-750 inclusive, THE API_Scoring_Engine SHALL classify as REVIEW (🟡)
3. WHEN composite score is below 600, THE API_Scoring_Engine SHALL classify as REJECTED (🔴)
4. THE decision classification SHALL be deterministic for any given score

### Requirement 5: Mock API Integration

**User Story:** As a developer, I want realistic mock API responses, so that the prototype demonstrates real-world behavior.

#### Acceptance Criteria

1. THE Credit_Bureau_API SHALL return scores in range [300, 850]
2. THE ESG_Data_Provider SHALL return scores in range [0, 100]
3. WHEN API calls are made, THE system SHALL simulate latency of 500-1500ms
4. THE Credit_Bureau_API SHALL return deterministic scores for the same SSN
5. THE ESG_Data_Provider SHALL return industry-specific scores

### Requirement 6: Auto-Navigation

**User Story:** As a loan officer, I want automatic progression to the decision screen, so that the workflow is seamless.

#### Acceptance Criteria

1. WHEN scoring completes, THE API_Scoring_Engine SHALL display results for 2 seconds
2. AFTER 2 seconds, THE system SHALL automatically navigate to Decision screen
3. THE system SHALL display countdown indicator during the delay
