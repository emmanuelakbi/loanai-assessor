import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateCSVColumns,
  validateCSVData,
  parseCSVHeader,
  REQUIRED_COLUMNS,
} from './csvValidator';

describe('csvValidator', () => {
  describe('REQUIRED_COLUMNS', () => {
    it('should contain all required columns', () => {
      expect(REQUIRED_COLUMNS).toEqual([
        'name',
        'ssn',
        'annual_income',
        'total_assets',
        'company',
        'industry',
      ]);
    });
  });

  describe('validateCSVColumns', () => {
    it('should return valid for CSV with all required columns', () => {
      const columns = ['name', 'ssn', 'annual_income', 'total_assets', 'company', 'industry'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
      expect(result.missingColumns).toBeUndefined();
      expect(result.foundColumns).toEqual(columns);
    });

    it('should return valid for CSV with extra columns', () => {
      const columns = ['name', 'ssn', 'annual_income', 'total_assets', 'company', 'industry', 'extra_col'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(true);
    });

    it('should return invalid when missing one column', () => {
      const columns = ['name', 'ssn', 'annual_income', 'total_assets', 'company'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Missing required columns: industry');
      expect(result.missingColumns).toEqual(['industry']);
    });

    it('should return invalid when missing multiple columns', () => {
      const columns = ['name', 'ssn'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Missing required columns: annual_income, total_assets, company, industry');
      expect(result.missingColumns).toEqual(['annual_income', 'total_assets', 'company', 'industry']);
    });

    it('should return invalid for empty columns array', () => {
      const result = validateCSVColumns([]);
      
      expect(result.isValid).toBe(false);
      expect(result.missingColumns).toEqual([...REQUIRED_COLUMNS]);
    });

    it('should handle case-insensitive column matching', () => {
      const columns = ['NAME', 'SSN', 'ANNUAL_INCOME', 'TOTAL_ASSETS', 'COMPANY', 'INDUSTRY'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle columns with whitespace', () => {
      const columns = [' name ', ' ssn', 'annual_income ', ' total_assets ', 'company', 'industry'];
      const result = validateCSVColumns(columns);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCSVData', () => {
    it('should return valid for data with all required columns', () => {
      const data = [
        { name: 'John', ssn: '123-45-6789', annual_income: '50000', total_assets: '100000', company: 'Acme', industry: 'Tech' },
      ];
      const result = validateCSVData(data);
      
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for empty data array', () => {
      const result = validateCSVData([]);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('CSV file is empty or contains no data rows');
    });

    it('should return invalid for null/undefined data', () => {
      const result = validateCSVData(null as unknown as Record<string, string>[]);
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('CSV file is empty or contains no data rows');
    });

    it('should return invalid when data is missing required columns', () => {
      const data = [
        { name: 'John', ssn: '123-45-6789' },
      ];
      const result = validateCSVData(data);
      
      expect(result.isValid).toBe(false);
      expect(result.missingColumns).toContain('annual_income');
    });
  });

  describe('parseCSVHeader', () => {
    it('should parse simple comma-separated header', () => {
      const header = 'name,ssn,annual_income';
      const result = parseCSVHeader(header);
      
      expect(result).toEqual(['name', 'ssn', 'annual_income']);
    });

    it('should trim whitespace from column names', () => {
      const header = ' name , ssn , annual_income ';
      const result = parseCSVHeader(header);
      
      expect(result).toEqual(['name', 'ssn', 'annual_income']);
    });

    it('should remove quotes from column names', () => {
      const header = '"name","ssn","annual_income"';
      const result = parseCSVHeader(header);
      
      expect(result).toEqual(['name', 'ssn', 'annual_income']);
    });

    it('should handle single quotes', () => {
      const header = "'name','ssn','annual_income'";
      const result = parseCSVHeader(header);
      
      expect(result).toEqual(['name', 'ssn', 'annual_income']);
    });
  });
});


/**
 * Property 2: CSV Validation
 * **Validates: Requirements 1.3, 1.5**
 * 
 * For any CSV: all required columns → pass, missing columns → fail with error.
 * 
 * Requirements:
 * - 1.3: THE Batch_Processor SHALL validate required columns: name, ssn, annual_income, total_assets, company, industry
 * - 1.5: IF CSV missing columns, THEN display error message
 */
describe('Property 2: CSV Validation', () => {
  // Arbitrary for generating random extra column names (not in required columns)
  const extraColumnArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/).filter(
    col => !REQUIRED_COLUMNS.includes(col.toLowerCase() as typeof REQUIRED_COLUMNS[number])
  );

  // Arbitrary for generating arrays of extra columns
  const extraColumnsArb = fc.array(extraColumnArb, { minLength: 0, maxLength: 10 });

  // Arbitrary for generating a non-empty subset of required columns (for missing column tests)
  const missingColumnsSubsetArb = fc.subarray([...REQUIRED_COLUMNS], { minLength: 1, maxLength: REQUIRED_COLUMNS.length });

  // Arbitrary for case variations of column names
  const caseVariationArb = fc.constantFrom('lower', 'upper', 'mixed') as fc.Arbitrary<'lower' | 'upper' | 'mixed'>;

  /**
   * Helper to apply case variation to a column name
   */
  function applyCaseVariation(col: string, variation: 'lower' | 'upper' | 'mixed'): string {
    switch (variation) {
      case 'lower':
        return col.toLowerCase();
      case 'upper':
        return col.toUpperCase();
      case 'mixed':
        return col.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('');
    }
  }

  /**
   * Property 2a: CSV with all required columns passes validation
   * **Validates: Requirements 1.3, 1.5**
   * 
   * For any CSV containing all required columns (with any case variation and extra columns),
   * validation SHALL pass.
   */
  it('CSV with all required columns passes validation', () => {
    fc.assert(
      fc.property(
        extraColumnsArb,
        caseVariationArb,
        fc.boolean(), // shuffle order
        (extraCols, caseVar, shuffle) => {
          // Create columns with all required columns plus any extra columns
          let columns = [...REQUIRED_COLUMNS.map(col => applyCaseVariation(col, caseVar)), ...extraCols];
          
          // Optionally shuffle the order
          if (shuffle) {
            columns = columns.sort(() => Math.random() - 0.5);
          }
          
          const result = validateCSVColumns(columns);
          
          expect(result.isValid).toBe(true);
          expect(result.errorMessage).toBeUndefined();
          expect(result.missingColumns).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2b: CSV missing any required columns fails validation with error
   * **Validates: Requirements 1.3, 1.5**
   * 
   * For any CSV missing at least one required column, validation SHALL fail
   * and return an error message listing the missing columns.
   */
  it('CSV missing required columns fails validation with error message', () => {
    fc.assert(
      fc.property(
        missingColumnsSubsetArb,
        extraColumnsArb,
        (missingCols, extraCols) => {
          // Create columns with only the required columns that are NOT in missingCols
          const presentColumns = REQUIRED_COLUMNS.filter(col => !missingCols.includes(col));
          const columns = [...presentColumns, ...extraCols];
          
          const result = validateCSVColumns(columns);
          
          // Validation should fail
          expect(result.isValid).toBe(false);
          
          // Error message should be present (Requirement 1.5)
          expect(result.errorMessage).toBeDefined();
          expect(result.errorMessage).toContain('Missing required columns');
          
          // Missing columns should be reported
          expect(result.missingColumns).toBeDefined();
          expect(result.missingColumns!.length).toBe(missingCols.length);
          
          // All missing columns should be in the result
          for (const missing of missingCols) {
            expect(result.missingColumns).toContain(missing);
            expect(result.errorMessage).toContain(missing);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2c: Empty columns array fails validation
   * **Validates: Requirements 1.3, 1.5**
   * 
   * An empty CSV (no columns) SHALL fail validation with all required columns reported as missing.
   */
  it('empty columns array fails validation with all required columns missing', () => {
    const result = validateCSVColumns([]);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeDefined();
    expect(result.missingColumns).toBeDefined();
    expect(result.missingColumns!.length).toBe(REQUIRED_COLUMNS.length);
    
    // All required columns should be reported as missing
    for (const required of REQUIRED_COLUMNS) {
      expect(result.missingColumns).toContain(required);
    }
  });

  /**
   * Property 2d: Validation is case-insensitive for column names
   * **Validates: Requirements 1.3, 1.5**
   * 
   * Column name matching SHALL be case-insensitive.
   */
  it('validation is case-insensitive for column names', () => {
    fc.assert(
      fc.property(
        fc.array(caseVariationArb, { minLength: REQUIRED_COLUMNS.length, maxLength: REQUIRED_COLUMNS.length }),
        (caseVariations) => {
          // Apply different case variations to each required column
          const columns = REQUIRED_COLUMNS.map((col, i) => applyCaseVariation(col, caseVariations[i]));
          
          const result = validateCSVColumns(columns);
          
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2e: Validation handles whitespace in column names
   * **Validates: Requirements 1.3, 1.5**
   * 
   * Column names with leading/trailing whitespace SHALL be trimmed and validated correctly.
   */
  it('validation handles whitespace in column names', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[ ]{0,3}$/), { minLength: REQUIRED_COLUMNS.length, maxLength: REQUIRED_COLUMNS.length }),
        fc.array(fc.stringMatching(/^[ ]{0,3}$/), { minLength: REQUIRED_COLUMNS.length, maxLength: REQUIRED_COLUMNS.length }),
        (leadingSpaces, trailingSpaces) => {
          // Add whitespace to each required column
          const columns = REQUIRED_COLUMNS.map((col, i) => 
            leadingSpaces[i] + col + trailingSpaces[i]
          );
          
          const result = validateCSVColumns(columns);
          
          expect(result.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2f: validateCSVData with valid data passes validation
   * **Validates: Requirements 1.3, 1.5**
   * 
   * For any non-empty CSV data with all required columns, validation SHALL pass.
   */
  it('validateCSVData with all required columns passes validation', () => {
    // Arbitrary for generating valid row data
    const rowDataArb = fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      ssn: fc.stringMatching(/^\d{3}-\d{2}-\d{4}$/),
      annual_income: fc.integer({ min: 0, max: 10000000 }).map(String),
      total_assets: fc.integer({ min: 0, max: 100000000 }).map(String),
      company: fc.string({ minLength: 1, maxLength: 100 }),
      industry: fc.constantFrom('Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail'),
    });

    fc.assert(
      fc.property(
        fc.array(rowDataArb, { minLength: 1, maxLength: 10 }),
        (rows) => {
          const result = validateCSVData(rows);
          
          expect(result.isValid).toBe(true);
          expect(result.errorMessage).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2g: validateCSVData with empty array fails validation
   * **Validates: Requirements 1.3, 1.5**
   * 
   * Empty CSV data SHALL fail validation with appropriate error message.
   */
  it('validateCSVData with empty array fails validation', () => {
    const result = validateCSVData([]);
    
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('CSV file is empty or contains no data rows');
  });

  /**
   * Property 2h: validateCSVData with missing columns fails validation
   * **Validates: Requirements 1.3, 1.5**
   * 
   * CSV data missing required columns SHALL fail validation with error message.
   */
  it('validateCSVData with missing columns fails validation', () => {
    fc.assert(
      fc.property(
        missingColumnsSubsetArb,
        (missingCols) => {
          // Create a row with only the columns that are NOT missing
          const presentColumns = REQUIRED_COLUMNS.filter(col => !missingCols.includes(col));
          const row: Record<string, string> = {};
          for (const col of presentColumns) {
            row[col] = 'test_value';
          }
          
          const result = validateCSVData([row]);
          
          expect(result.isValid).toBe(false);
          expect(result.errorMessage).toBeDefined();
          expect(result.errorMessage).toContain('Missing required columns');
          expect(result.missingColumns).toBeDefined();
          expect(result.missingColumns!.length).toBe(missingCols.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2i: Validation result is deterministic
   * **Validates: Requirements 1.3, 1.5**
   * 
   * For any given input, validation SHALL produce the same result every time.
   */
  it('validation result is deterministic', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 15 }),
        (columns) => {
          const result1 = validateCSVColumns(columns);
          const result2 = validateCSVColumns(columns);
          
          expect(result1.isValid).toBe(result2.isValid);
          expect(result1.errorMessage).toBe(result2.errorMessage);
          
          if (result1.missingColumns && result2.missingColumns) {
            expect(result1.missingColumns.sort()).toEqual(result2.missingColumns.sort());
          } else {
            expect(result1.missingColumns).toBe(result2.missingColumns);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
