/**
 * CSV Validation Service
 * 
 * Pure functions for validating CSV data for batch loan processing.
 * 
 * Requirements:
 * - 1.3: Validate required columns: name, ssn, annual_income, total_assets, company, industry
 * - 1.5: Display error message if CSV missing columns
 */

/**
 * Required columns for batch loan processing CSV files
 */
export const REQUIRED_COLUMNS = [
  'name',
  'ssn',
  'annual_income',
  'total_assets',
  'company',
  'industry',
] as const;

export type RequiredColumn = typeof REQUIRED_COLUMNS[number];

/**
 * Result of CSV validation
 */
export interface CSVValidationResult {
  /** Whether the CSV is valid */
  isValid: boolean;
  /** Error message if validation failed */
  errorMessage?: string;
  /** List of missing columns if any */
  missingColumns?: string[];
  /** List of columns found in the CSV */
  foundColumns?: string[];
}

/**
 * Validates that a CSV has all required columns for batch loan processing.
 * 
 * @param columns - Array of column names from the CSV header
 * @returns Validation result with error details if invalid
 * 
 * Requirements:
 * - 1.3: Validate required columns: name, ssn, annual_income, total_assets, company, industry
 * - 1.5: Display error message if CSV missing columns
 */
export function validateCSVColumns(columns: string[]): CSVValidationResult {
  // Normalize column names to lowercase and trim whitespace for comparison
  const normalizedColumns = columns.map(col => col.toLowerCase().trim());
  
  // Find missing required columns
  const missingColumns = REQUIRED_COLUMNS.filter(
    required => !normalizedColumns.includes(required.toLowerCase())
  );
  
  if (missingColumns.length > 0) {
    const missingList = missingColumns.join(', ');
    return {
      isValid: false,
      errorMessage: `Missing required columns: ${missingList}`,
      missingColumns: [...missingColumns],
      foundColumns: columns,
    };
  }
  
  return {
    isValid: true,
    foundColumns: columns,
  };
}

/**
 * Validates CSV data parsed by PapaParse.
 * Checks that the data has required columns and at least one row.
 * 
 * @param data - Array of parsed CSV rows as objects
 * @returns Validation result with error details if invalid
 */
export function validateCSVData(data: Record<string, string>[]): CSVValidationResult {
  // Check if data is empty
  if (!data || data.length === 0) {
    return {
      isValid: false,
      errorMessage: 'CSV file is empty or contains no data rows',
      foundColumns: [],
    };
  }
  
  // Get columns from the first row's keys
  const columns = Object.keys(data[0]);
  
  // Validate columns
  return validateCSVColumns(columns);
}

/**
 * Extracts column names from a CSV header string.
 * Useful for validating before full parsing.
 * 
 * @param headerLine - The first line of a CSV file
 * @returns Array of column names
 */
export function parseCSVHeader(headerLine: string): string[] {
  // Simple CSV header parsing - handles basic cases
  // For complex cases with quoted fields, use PapaParse
  return headerLine
    .split(',')
    .map(col => col.trim().replace(/^["']|["']$/g, ''));
}
