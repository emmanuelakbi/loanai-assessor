import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  pdf,
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Borrower, LoanTerms, CreditScore } from '../../types';

export interface PDFPreviewProps {
  borrower: Borrower;
  loanTerms: LoanTerms;
  creditScore: CreditScore;
  date: Date;
}

// PDF document styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #10B981',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1px solid #E5E7EB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: '40%',
    color: '#6B7280',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
    color: '#111827',
  },
  highlightValue: {
    width: '60%',
    color: '#10B981',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 9,
    borderTop: '1px solid #E5E7EB',
    paddingTop: 10,
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

/**
 * Format a number as currency (USD)
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as percentage
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format term months as years and months
 */
function formatTermLength(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * LoanAgreementDocument - The PDF document template
 */
export const LoanAgreementDocument: React.FC<PDFPreviewProps> = ({
  borrower,
  loanTerms,
  creditScore,
  date,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Loan Agreement</Text>
        <Text style={styles.subtitle}>
          Document Date: {formatDate(date)}
        </Text>
      </View>

      {/* Borrower Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Borrower Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Full Name:</Text>
          <Text style={styles.value}>{borrower.fullName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Company:</Text>
          <Text style={styles.value}>{borrower.companyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Industry Sector:</Text>
          <Text style={styles.value}>{borrower.industrySector}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Annual Income:</Text>
          <Text style={styles.value}>{formatCurrency(borrower.annualIncome)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Assets:</Text>
          <Text style={styles.value}>{formatCurrency(borrower.totalAssets)}</Text>
        </View>
      </View>

      {/* Loan Terms Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Terms</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Principal Amount:</Text>
          <Text style={styles.highlightValue}>
            {formatCurrency(loanTerms.principalAmount)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Interest Rate:</Text>
          <Text style={styles.value}>{formatPercentage(loanTerms.interestRate)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Term Length:</Text>
          <Text style={styles.value}>{formatTermLength(loanTerms.termMonths)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Payment:</Text>
          <Text style={styles.highlightValue}>
            {formatCurrency(loanTerms.monthlyPayment)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Interest:</Text>
          <Text style={styles.value}>{formatCurrency(loanTerms.totalInterest)}</Text>
        </View>
      </View>

      {/* Credit Assessment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Credit Assessment</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Credit Score:</Text>
          <Text style={styles.value}>
            {creditScore.score} / {creditScore.maxScore}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Account Age:</Text>
          <Text style={styles.value}>
            {creditScore.history.accountAge} year{creditScore.history.accountAge !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>On-Time Payments:</Text>
          <Text style={styles.value}>{creditScore.history.onTimePayments}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Credit Utilization:</Text>
          <Text style={styles.value}>{creditScore.history.creditUtilization}%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data Source:</Text>
          <Text style={styles.value}>{creditScore.source}</Text>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          This document is a preliminary loan agreement generated by LoanAI Assessor.
          Final terms are subject to verification and approval. This document does not
          constitute a binding agreement until signed by all parties.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Generated by LoanAI Assessor • {formatDate(loanTerms.generatedAt)}
      </Text>
    </Page>
  </Document>
);

/**
 * PDFPreview Component
 * Displays a preview of the loan agreement document
 * Requirements: 3.1, 3.2
 */
export const PDFPreview: React.FC<PDFPreviewProps> = (props) => {
  const viewerStyle: Style = {
    width: '100%',
    height: 600,
    border: '1px solid #E5E7EB',
    borderRadius: 8,
  };

  return (
    <div data-testid="pdf-preview">
      <PDFViewer style={viewerStyle}>
        <LoanAgreementDocument {...props} />
      </PDFViewer>
    </div>
  );
};

/**
 * Generate a filename for the PDF document
 */
export function generatePDFFilename(borrowerName: string, date: Date): string {
  const sanitizedName = borrowerName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = date.toISOString().split('T')[0];
  return `Loan_Agreement_${sanitizedName}_${dateStr}.pdf`;
}

/**
 * PDFDownloadButton Component
 * Provides a download link for the loan agreement PDF
 * Requirements: 3.3
 */
export interface PDFDownloadButtonProps extends PDFPreviewProps {
  className?: string;
  children?: React.ReactNode;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  borrower,
  loanTerms,
  creditScore,
  date,
  className,
  children,
}) => {
  const filename = generatePDFFilename(borrower.fullName, date);

  return (
    <PDFDownloadLink
      document={
        <LoanAgreementDocument
          borrower={borrower}
          loanTerms={loanTerms}
          creditScore={creditScore}
          date={date}
        />
      }
      fileName={filename}
      className={className}
      data-testid="pdf-download-button"
    >
      {({ loading }) =>
        loading ? 'Preparing document...' : (children || 'Export PDF')
      }
    </PDFDownloadLink>
  );
};

/**
 * Programmatically download the PDF document
 * Useful for custom download triggers (e.g., button click handlers)
 * Requirements: 3.3
 */
export async function downloadPDF(props: PDFPreviewProps): Promise<void> {
  const { borrower, loanTerms, creditScore, date } = props;
  const filename = generatePDFFilename(borrower.fullName, date);

  // Generate the PDF blob
  const blob = await pdf(
    <LoanAgreementDocument
      borrower={borrower}
      loanTerms={loanTerms}
      creditScore={creditScore}
      date={date}
    />
  ).toBlob();

  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default PDFPreview;
