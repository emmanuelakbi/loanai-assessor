import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validators, isFormValid, type BorrowerFormData, type ValidationErrors } from './validators';

/**
 * Feature: loanai-assessor, Property 3: Form Validation Correctness - SSN Pattern Validation
 * For any string input to SSNInput, the validation SHALL return valid only if
 * the input contains exactly 9 digits (ignoring dashes and spaces).
 * - SSN matching pattern ^\d{3}-\d{2}-\d{4}$ → valid
 * - SSN not matching pattern → invalid
 * **Validates: Requirements 2.2**
 */
describe('Property 3: SSN Pattern Validation', () => {
  it('valid 9-digit inputs pass validation', () => {
    fc.assert(
      fc.property(
        // Generate exactly 9 digits
        fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 9, maxLength: 9 }).map(arr => arr.join('')),
        (digits) => {
          const result = validators.ssn(digits);
          expect(result).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('9-digit inputs with dashes pass validation', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 9, maxLength: 9 }).map(arr => arr.join('')),
        (digits) => {
          // Format as XXX-XX-XXXX
          const formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
          const result = validators.ssn(formatted);
          expect(result).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('invalid lengths fail validation', () => {
    fc.assert(
      fc.property(
        // Generate digit strings that are NOT exactly 9 characters
        fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 0, maxLength: 20 })
          .map(arr => arr.join(''))
          .filter((s) => s.length !== 9),
        (digits) => {
          const result = validators.ssn(digits);
          expect(result).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-numeric inputs fail validation when they result in wrong digit count', () => {
    fc.assert(
      fc.property(
        // Generate strings with letters that when stripped of non-digits have wrong length
        fc.tuple(
          fc.array(fc.constantFrom('a', 'b', 'c', 'x', 'y', 'z'), { minLength: 1, maxLength: 5 }).map(arr => arr.join('')),
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 0, maxLength: 8 }).map(arr => arr.join(''))
        ).filter(([, digits]) => digits.length !== 9),
        ([letters, digits]) => {
          const mixed = letters + digits;
          const result = validators.ssn(mixed);
          expect(result).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: loanai-assessor, Property 3: Form Validation Correctness - Currency Validation
 * For any currency input:
 * - Annual Income > 0 → valid
 * - Annual Income <= 0 → invalid
 * - Total Assets >= 0 → valid
 * - Total Assets < 0 → invalid
 * **Validates: Requirements 2.2, 2.3**
 */
describe('Property 3: Currency Validation (Annual Income and Total Assets)', () => {
  it('positive annual income values pass validation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10000000, noNaN: true }),
        (income) => {
          const result = validators.annualIncome(income);
          expect(result).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('zero or negative annual income values fail validation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -10000000, max: 0, noNaN: true }),
        (income) => {
          const result = validators.annualIncome(income);
          expect(result).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('non-negative total assets values pass validation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100000000, noNaN: true }),
        (assets) => {
          const result = validators.totalAssets(assets);
          expect(result).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('negative total assets values fail validation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -100000000, max: -0.01, noNaN: true }),
        (assets) => {
          const result = validators.totalAssets(assets);
          expect(result).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: loanai-assessor, Property 3: Form Validation Correctness - Form State Consistency
 * For any form state, the FetchDataButton SHALL be enabled if and only if
 * all validation functions return undefined for their respective fields.
 * **Validates: Requirements 2.5, 2.7**
 */
describe('Property 3: Form State Consistency', () => {
  // Generator for valid industry sectors
  const industrySectorArb = fc.constantFrom(
    'Technology',
    'Healthcare',
    'Manufacturing',
    'Finance',
    'Energy',
    'Retail',
    'Agriculture',
    'Construction'
  );

  // Generator for valid SSN (9 digits)
  const validSSNArb = fc
    .array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 9, maxLength: 9 })
    .map(arr => arr.join(''))
    .map((digits) => `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`);

  // Generator for valid full name (at least 2 characters)
  const validNameArb = fc.string({ minLength: 2, maxLength: 50 }).filter((s) => s.trim().length >= 2);

  // Generator for valid annual income (positive number)
  const validIncomeArb = fc.double({ min: 0.01, max: 10000000, noNaN: true });

  // Generator for valid total assets (non-negative number)
  const validAssetsArb = fc.double({ min: 0, max: 100000000, noNaN: true });

  // Generator for valid company name (at least 2 characters)
  const validCompanyArb = fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length >= 2);

  it('button enabled when all fields are valid', () => {
    fc.assert(
      fc.property(
        fc.record({
          fullName: validNameArb,
          ssn: validSSNArb,
          annualIncome: validIncomeArb,
          totalAssets: validAssetsArb,
          companyName: validCompanyArb,
          industrySector: industrySectorArb,
        }),
        (data) => {
          const errors: ValidationErrors = {
            fullName: validators.fullName(data.fullName),
            ssn: validators.ssn(data.ssn),
            annualIncome: validators.annualIncome(data.annualIncome),
            totalAssets: validators.totalAssets(data.totalAssets),
            companyName: validators.companyName(data.companyName),
            industrySector: validators.industrySector(data.industrySector),
          };

          const result = isFormValid(data, errors);
          expect(result).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('button disabled when any field is invalid', () => {
    fc.assert(
      fc.property(
        fc.record({
          fullName: validNameArb,
          ssn: validSSNArb,
          annualIncome: validIncomeArb,
          totalAssets: validAssetsArb,
          companyName: validCompanyArb,
          industrySector: industrySectorArb,
        }),
        fc.constantFrom('fullName', 'ssn', 'annualIncome', 'totalAssets', 'companyName', 'industrySector'),
        (validData, fieldToInvalidate) => {
          // Create invalid data by breaking one field
          const invalidData: BorrowerFormData = { ...validData };
          
          switch (fieldToInvalidate) {
            case 'fullName':
              invalidData.fullName = ''; // Empty name
              break;
            case 'ssn':
              invalidData.ssn = '123'; // Too short
              break;
            case 'annualIncome':
              invalidData.annualIncome = 0; // Zero income
              break;
            case 'totalAssets':
              invalidData.totalAssets = -100; // Negative assets
              break;
            case 'companyName':
              invalidData.companyName = ''; // Empty company
              break;
            case 'industrySector':
              invalidData.industrySector = ''; // Empty sector
              break;
          }

          const errors: ValidationErrors = {
            fullName: validators.fullName(invalidData.fullName),
            ssn: validators.ssn(invalidData.ssn),
            annualIncome: validators.annualIncome(invalidData.annualIncome),
            totalAssets: validators.totalAssets(invalidData.totalAssets),
            companyName: validators.companyName(invalidData.companyName),
            industrySector: validators.industrySector(invalidData.industrySector),
          };

          const result = isFormValid(invalidData, errors);
          expect(result).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
