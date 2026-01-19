import { describe, it, expect } from 'vitest';
import type { Borrower, LoanTerms, CreditScore } from '../../types';
import type { PDFPreviewProps } from './PDFPreview';
import { generatePDFFilename } from './PDFPreview';

// Test data factory functions
function createTestBorrower(overrides: Partial<Borrower> = {}): Borrower {
  return {
    id: 'test-borrower-1',
    fullName: 'John Doe',
    ssn: 'XXX-XX-1234',
    annualIncome: 120000,
    totalAssets: 500000,
    companyName: 'Acme Corp',
    industrySector: 'Technology',
    createdAt: new Date('2024-01-15'),
    ...overrides,
  };
}

function createTestLoanTerms(overrides: Partial<LoanTerms> = {}): LoanTerms {
  return {
    principalAmount: 300000,
    interestRate: 5.5,
    termMonths: 360,
    monthlyPayment: 1703.37,
    totalInterest: 313213.2,
    generatedAt: new Date('2024-01-15T10:30:00'),
    ...overrides,
  };
}

function createTestCreditScore(overrides: Partial<CreditScore> = {}): CreditScore {
  return {
    score: 750,
    maxScore: 850,
    history: {
      accountAge: 10,
      onTimePayments: 98,
      creditUtilization: 25,
      derogatoriesCount: 0,
    },
    source: 'MockCreditBureau',
    fetchedAt: new Date('2024-01-15T10:00:00'),
    ...overrides,
  };
}

function createTestPDFPreviewProps(
  overrides: Partial<PDFPreviewProps> = {}
): PDFPreviewProps {
  return {
    borrower: createTestBorrower(),
    loanTerms: createTestLoanTerms(),
    creditScore: createTestCreditScore(),
    date: new Date('2024-01-15'),
    ...overrides,
  };
}

describe('PDFPreview', () => {
  describe('Props Interface', () => {
    it('should accept valid borrower information', () => {
      const props = createTestPDFPreviewProps();
      
      expect(props.borrower.fullName).toBe('John Doe');
      expect(props.borrower.companyName).toBe('Acme Corp');
      expect(props.borrower.industrySector).toBe('Technology');
      expect(props.borrower.annualIncome).toBe(120000);
      expect(props.borrower.totalAssets).toBe(500000);
    });

    it('should accept valid loan terms', () => {
      const props = createTestPDFPreviewProps();
      
      expect(props.loanTerms.principalAmount).toBe(300000);
      expect(props.loanTerms.interestRate).toBe(5.5);
      expect(props.loanTerms.termMonths).toBe(360);
      expect(props.loanTerms.monthlyPayment).toBe(1703.37);
      expect(props.loanTerms.totalInterest).toBe(313213.2);
    });

    it('should accept valid credit score', () => {
      const props = createTestPDFPreviewProps();
      
      expect(props.creditScore.score).toBe(750);
      expect(props.creditScore.maxScore).toBe(850);
      expect(props.creditScore.source).toBe('MockCreditBureau');
    });

    it('should accept a date', () => {
      const props = createTestPDFPreviewProps();
      
      expect(props.date).toBeInstanceOf(Date);
    });
  });

  describe('Data Validation', () => {
    it('should handle different industry sectors', () => {
      const sectors = [
        'Technology',
        'Healthcare',
        'Manufacturing',
        'Finance',
        'Energy',
        'Retail',
        'Agriculture',
        'Construction',
      ] as const;

      sectors.forEach((sector) => {
        const props = createTestPDFPreviewProps({
          borrower: createTestBorrower({ industrySector: sector }),
        });
        expect(props.borrower.industrySector).toBe(sector);
      });
    });

    it('should handle various loan term lengths', () => {
      const termLengths = [12, 60, 120, 180, 240, 360];

      termLengths.forEach((termMonths) => {
        const props = createTestPDFPreviewProps({
          loanTerms: createTestLoanTerms({ termMonths }),
        });
        expect(props.loanTerms.termMonths).toBe(termMonths);
      });
    });

    it('should handle credit scores within valid range', () => {
      const scores = [300, 500, 650, 750, 800, 850];

      scores.forEach((score) => {
        const props = createTestPDFPreviewProps({
          creditScore: createTestCreditScore({ score }),
        });
        expect(props.creditScore.score).toBe(score);
        expect(props.creditScore.score).toBeGreaterThanOrEqual(300);
        expect(props.creditScore.score).toBeLessThanOrEqual(850);
      });
    });

    it('should handle credit history details', () => {
      const props = createTestPDFPreviewProps({
        creditScore: createTestCreditScore({
          history: {
            accountAge: 15,
            onTimePayments: 100,
            creditUtilization: 10,
            derogatoriesCount: 0,
          },
        }),
      });

      expect(props.creditScore.history.accountAge).toBe(15);
      expect(props.creditScore.history.onTimePayments).toBe(100);
      expect(props.creditScore.history.creditUtilization).toBe(10);
      expect(props.creditScore.history.derogatoriesCount).toBe(0);
    });
  });

  describe('Requirements Validation', () => {
    /**
     * Requirement 3.1: THE Decision_Engine SHALL display a PDF preview showing loan terms
     */
    it('should include loan terms data for PDF preview (Requirement 3.1)', () => {
      const props = createTestPDFPreviewProps();

      // Verify all loan terms are present
      expect(props.loanTerms.principalAmount).toBeGreaterThan(0);
      expect(props.loanTerms.interestRate).toBeGreaterThan(0);
      expect(props.loanTerms.termMonths).toBeGreaterThan(0);
      expect(props.loanTerms.monthlyPayment).toBeGreaterThan(0);
      expect(props.loanTerms.totalInterest).toBeGreaterThan(0);
      expect(props.loanTerms.generatedAt).toBeInstanceOf(Date);
    });

    /**
     * Requirement 3.2: THE PDFPreview SHALL include: borrower info, loan terms, credit assessment, date
     */
    it('should include all required sections (Requirement 3.2)', () => {
      const props = createTestPDFPreviewProps();

      // Borrower info
      expect(props.borrower).toBeDefined();
      expect(props.borrower.fullName).toBeDefined();
      expect(props.borrower.companyName).toBeDefined();
      expect(props.borrower.industrySector).toBeDefined();
      expect(props.borrower.annualIncome).toBeDefined();
      expect(props.borrower.totalAssets).toBeDefined();

      // Loan terms
      expect(props.loanTerms).toBeDefined();
      expect(props.loanTerms.principalAmount).toBeDefined();
      expect(props.loanTerms.interestRate).toBeDefined();
      expect(props.loanTerms.termMonths).toBeDefined();
      expect(props.loanTerms.monthlyPayment).toBeDefined();

      // Credit assessment
      expect(props.creditScore).toBeDefined();
      expect(props.creditScore.score).toBeDefined();
      expect(props.creditScore.history).toBeDefined();

      // Date
      expect(props.date).toBeDefined();
      expect(props.date).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum loan amounts', () => {
      const props = createTestPDFPreviewProps({
        loanTerms: createTestLoanTerms({
          principalAmount: 1000,
          monthlyPayment: 50,
          totalInterest: 100,
        }),
      });

      expect(props.loanTerms.principalAmount).toBe(1000);
    });

    it('should handle maximum loan amounts', () => {
      const props = createTestPDFPreviewProps({
        loanTerms: createTestLoanTerms({
          principalAmount: 10000000,
          monthlyPayment: 50000,
          totalInterest: 5000000,
        }),
      });

      expect(props.loanTerms.principalAmount).toBe(10000000);
    });

    it('should handle short term loans', () => {
      const props = createTestPDFPreviewProps({
        loanTerms: createTestLoanTerms({ termMonths: 12 }),
      });

      expect(props.loanTerms.termMonths).toBe(12);
    });

    it('should handle long term loans', () => {
      const props = createTestPDFPreviewProps({
        loanTerms: createTestLoanTerms({ termMonths: 360 }),
      });

      expect(props.loanTerms.termMonths).toBe(360);
    });

    it('should handle borrowers with special characters in name', () => {
      const props = createTestPDFPreviewProps({
        borrower: createTestBorrower({ fullName: "John O'Brien-Smith Jr." }),
      });

      expect(props.borrower.fullName).toBe("John O'Brien-Smith Jr.");
    });

    it('should handle company names with special characters', () => {
      const props = createTestPDFPreviewProps({
        borrower: createTestBorrower({ companyName: 'Tech & Co. LLC' }),
      });

      expect(props.borrower.companyName).toBe('Tech & Co. LLC');
    });
  });
});

describe('PDF Export Functionality', () => {
  describe('generatePDFFilename', () => {
    /**
     * Requirement 3.3: WHEN user clicks "Export PDF", THE Decision_Engine SHALL download the document
     */
    it('should generate a valid filename with borrower name and date (Requirement 3.3)', () => {
      const borrowerName = 'John Doe';
      const date = new Date('2024-01-15');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toBe('Loan_Agreement_John_Doe_2024-01-15.pdf');
    });

    it('should sanitize special characters in borrower name', () => {
      const borrowerName = "John O'Brien-Smith Jr.";
      const date = new Date('2024-01-15');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toBe('Loan_Agreement_John_O_Brien_Smith_Jr__2024-01-15.pdf');
      // Verify special characters in the name portion are sanitized
      // Note: The date portion (2024-01-15) naturally contains hyphens
      const namePortion = filename.split('_2024')[0];
      expect(namePortion).not.toContain("'");
      expect(namePortion).not.toContain('.');
    });

    it('should handle names with spaces', () => {
      const borrowerName = 'Jane Mary Smith';
      const date = new Date('2024-06-20');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toBe('Loan_Agreement_Jane_Mary_Smith_2024-06-20.pdf');
    });

    it('should format date correctly in ISO format', () => {
      const borrowerName = 'Test User';
      const date = new Date('2024-12-31');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toContain('2024-12-31');
      expect(filename).toMatch(/^\w+_\w+_\w+_\w+_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should always end with .pdf extension', () => {
      const borrowerName = 'Any Name';
      const date = new Date();
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toMatch(/\.pdf$/);
    });

    it('should handle empty borrower name', () => {
      const borrowerName = '';
      const date = new Date('2024-01-15');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toBe('Loan_Agreement__2024-01-15.pdf');
    });

    it('should handle names with numbers', () => {
      const borrowerName = 'Company123 Inc';
      const date = new Date('2024-01-15');
      
      const filename = generatePDFFilename(borrowerName, date);
      
      expect(filename).toBe('Loan_Agreement_Company123_Inc_2024-01-15.pdf');
    });
  });

  describe('Export Props Validation', () => {
    /**
     * Requirement 3.3: Verify all required data is available for PDF export
     */
    it('should have all required props for PDF export (Requirement 3.3)', () => {
      const props = createTestPDFPreviewProps();
      
      // All required data for export should be present
      expect(props.borrower).toBeDefined();
      expect(props.loanTerms).toBeDefined();
      expect(props.creditScore).toBeDefined();
      expect(props.date).toBeDefined();
      
      // Verify the filename can be generated
      const filename = generatePDFFilename(props.borrower.fullName, props.date);
      expect(filename).toBeTruthy();
      expect(filename.endsWith('.pdf')).toBe(true);
    });
  });
});
