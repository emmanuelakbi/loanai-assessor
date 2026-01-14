# LoanAI Assessor - Spec Execution Guide

## What Is This?

LoanAI Assessor is a desktop prototype for the **LMA EDGE Hackathon's Digital Loans category**. It shows how banks can use AI to review loans faster.

**The Big Idea**: Banks currently take 5 minutes to manually review each loan. LoanAI does it in 30 seconds using AI.

---

## The Problem We're Solving

Right now, loan officers spend their whole day doing repetitive work:
- Reading application forms
- Calling credit bureaus
- Checking income documents
- Verifying ESG compliance

**100 loans × 5 minutes each = 500 minutes (8+ hours) per officer per day**

LoanAI automates all of this. Same 100 loans take only 50 minutes.

---

## How It Works (Simple Version)

The app calculates a **Composite Score** from 0-1000 using three data sources:

| Data Source | Weight | What It Checks |
|-------------|--------|----------------|
| Credit Score | 40% | Payment history, credit utilization |
| Income/Assets | 30% | Debt-to-income ratio, savings |
| ESG Score | 30% | Environmental/social/governance compliance |

**Decision Rules**:
- Score > 750 → 🟢 **APPROVED** (auto-approve)
- Score 600-750 → 🟡 **REVIEW** (human reviews)
- Score < 600 → 🔴 **REJECTED** (auto-reject)

---

## The 5 Screens

### Screen 1: Dashboard
The home screen. Shows:
- Sidebar menu (navigate to other screens)
- Today's stats (how many loans processed)
- Recent loans table with status icons (🟢🟡🔴)

### Screen 2: Borrower Input
A form to enter loan applicant info:
- Name, SSN, Annual Income, Total Assets
- Company Name, Industry Sector
- Click "Fetch Data" → loading spinner → goes to scoring

### Screen 3: Real-Time Scoring
Shows the AI doing its work:
- Big circular gauge showing composite score (e.g., 782/1000)
- Three progress bars showing each component:
  - Credit: 720/850 (contributes 339 points)
  - Income: DTI 28% (contributes 243 points)
  - ESG: 85/100 (contributes 200 points)
- Decision badge appears: 🟢 APPROVED

### Screen 4: Decision Screen
Final result with:
- Big green/yellow/red banner showing decision
- Loan terms (if approved): Principal, Interest Rate, Monthly Payment
- PDF preview of the loan agreement
- Audit trail showing all data sources used
- "Export PDF" and "New Assessment" buttons

### Screen 5: Batch Processor
For processing many loans at once:
- Upload a CSV file with 1000 loan applications
- Progress bar shows processing (takes ~30 seconds total)
- Results table: 700 approved, 200 review, 100 rejected
- Export all results as CSV

---

## Business Impact (What Judges Care About)

### Time Savings
```
Manual: 5 min × 100 loans = 500 min/day
AI:    30 sec × 100 loans =  50 min/day
────────────────────────────────────────
Savings: 450 min/day (90% reduction)
```

### Cost Savings
- Average loan officer salary: ~$100k/year
- Time saved = money saved
- **$2 million/year savings per 100 loan officers**

### Market Opportunity
- Global loan market: **$5 trillion**
- If we capture just 1%: **$50 billion addressable market**

---

## No Real APIs Needed

The prototype uses **mock data** that looks like real API responses:

```json
{
  "credit": {
    "score": 720,
    "bureau": "Experian",
    "inquiries": 2
  },
  "income": {
    "annual": 120000,
    "dti": 0.28,
    "assets": 250000
  },
  "esg": {
    "carbon": 45,
    "compliance": "ISO14001",
    "score": 85
  }
}
```

The mock APIs add realistic delays (500-1500ms) so it feels like real data fetching.

---

## Demo Video Script (90 Seconds)

| Time | What to Show |
|------|--------------|
| 0:00-0:20 | The problem: manual reviews are slow and expensive |
| 0:20-0:45 | Demo single loan: form → scoring animation → approved |
| 0:45-1:10 | Demo batch: upload CSV → process 1000 loans → results |
| 1:10-1:30 | Show metrics: 90% time saved, $2M savings, $5T market |

---

## Why This Wins (Judging Criteria)

| Criteria | How We Hit It |
|----------|---------------|
| **Usability** | Clean fintech UI, intuitive 3-click workflow |
| **Impact** | Quantified: 90% faster, $2M savings |
| **Uniqueness** | ESG scoring integration (not just credit) |
| **Market Fit** | $5T TAM, banks already need this |
| **Scalability** | Batch mode proves enterprise readiness |

---

## Spec Modules Overview

## Spec Modules

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `loanai-assessor/` | Master spec - project setup, types, routing, integration | requirements.md, design.md, tasks.md |
| `loanai-borrower-input/` | Borrower data collection form (Screen 2) | requirements.md, design.md, tasks.md |
| `loanai-api-scoring/` | Scoring engine, mock APIs, score visualization (Screen 3) | requirements.md, design.md, tasks.md |
| `loanai-decision-engine/` | Decision display, loan terms, PDF export (Screen 4) | requirements.md, design.md, tasks.md |
| `loanai-batch-processor/` | CSV upload, bulk processing, results table (Screen 5) | requirements.md, design.md, tasks.md |
| `loanai-dashboard/` | Metrics cards, recent assessments, ROI calculator (Screen 1) | requirements.md, design.md, tasks.md |
| `loanai-demo-assets/` | Video script, pitch deck, sample data | requirements.md, design.md, tasks.md |

---

## Build Sequence

Execute specs in this order. Each phase builds on the previous.

### Phase 1: Foundation
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-assessor` | 1-2 | Vite project, types, Zustand store, routing, sidebar layout |

### Phase 2: Core Services
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-api-scoring` | 1-2 | Mock Credit Bureau API, Mock ESG API, scoring engine with property tests |

### Phase 3: Main Workflow (Single Loan)
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-borrower-input` | 1-5 | Form components, validation, borrower input screen |
| `loanai-api-scoring` | 3-5 | Score gauge, breakdown bars, decision indicator, scoring screen |
| `loanai-decision-engine` | 1-6 | Decision banner, loan terms, PDF preview, audit trail, decision screen |

**Checkpoint**: Single loan flow works (Input → Scoring → Decision)

### Phase 4: Master Integration
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-assessor` | 5-9 | Wired navigation, checkpoint validation |

### Phase 5: Dashboard & Batch
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-dashboard` | 1-5 | Metrics cards, recent assessments table, ROI calculator |
| `loanai-batch-processor` | 1-6 | CSV dropzone, progress bar, results table, batch summary |

### Phase 6: Final Integration
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-assessor` | 10-13 | All screens wired, transitions, accessibility, sample data |

**Checkpoint**: Full app complete with all 5 screens

### Phase 7: Demo Prep
| Spec | Tasks | What You Get |
|------|-------|--------------|
| `loanai-demo-assets` | 1-5 | Video script, business metrics, pitch deck outline, sample borrowers |

---

## Quick Reference

### Tech Stack
- React 18 + TypeScript
- Tailwind CSS (fintech theme)
- Zustand (state management)
- React Router v6
- Recharts (visualizations)
- @react-pdf/renderer (PDF export)
- PapaParse (CSV parsing)
- fast-check (property-based testing)

### Design Tokens
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#1E3A8A` | Headers, buttons, sidebar |
| Background | `#F8FAFC` | Content areas |
| Success | `#10B981` | Approved status |
| Warning | `#F59E0B` | Review status |
| Error | `#EF4444` | Rejected status |

### Decision Thresholds
| Score Range | Decision |
|-------------|----------|
| > 750 | 🟢 APPROVED |
| 600-750 | 🟡 REVIEW |
| < 600 | 🔴 REJECTED |

### Scoring Weights
| Component | Weight | Max Points |
|-----------|--------|------------|
| Credit Score | 40% | 400 |
| Income/Assets | 30% | 300 |
| ESG Score | 30% | 300 |
| **Total** | 100% | **1000** |

---

## How to Run a Spec

1. Open the spec's `tasks.md` file
2. Work through tasks in order
3. Stop at checkpoints to verify tests pass
4. Move to next spec in the build sequence

Each task references specific requirements from `requirements.md` for traceability.
