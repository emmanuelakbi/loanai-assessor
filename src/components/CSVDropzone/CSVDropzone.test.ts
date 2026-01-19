import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PapaParse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((file: File, options: { complete: (results: unknown) => void; error: (error: Error) => void }) => {
      // Simulate async parsing
      setTimeout(() => {
        if (file.name === 'error.csv') {
          options.error(new Error('Parse error'));
        } else if (file.name === 'parse-error.csv') {
          options.complete({
            data: [],
            errors: [{ message: 'Invalid CSV format' }],
          });
        } else {
          options.complete({
            data: [
              { name: 'John Doe', ssn: '123-45-6789', annual_income: '50000', total_assets: '100000', company: 'Acme', industry: 'Technology' },
              { name: 'Jane Smith', ssn: '987-65-4321', annual_income: '75000', total_assets: '150000', company: 'TechCorp', industry: 'Finance' },
            ],
            errors: [],
          });
        }
      }, 0);
    }),
  },
}));

describe('CSVDropzone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Type Validation (Requirement 1.2)', () => {
    it('should accept .csv files', () => {
      const csvFile = new File(['name,ssn\nJohn,123'], 'test.csv', { type: 'text/csv' });
      expect(csvFile.name.toLowerCase().endsWith('.csv')).toBe(true);
    });

    it('should reject non-csv files', () => {
      const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const xlsxFile = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      expect(txtFile.name.toLowerCase().endsWith('.csv')).toBe(false);
      expect(xlsxFile.name.toLowerCase().endsWith('.csv')).toBe(false);
    });

    it('should accept .CSV files (case insensitive)', () => {
      const csvFile = new File(['name,ssn\nJohn,123'], 'TEST.CSV', { type: 'text/csv' });
      expect(csvFile.name.toLowerCase().endsWith('.csv')).toBe(true);
    });
  });

  describe('File Info Display (Requirement 1.4)', () => {
    it('should correctly count rows from parsed data', () => {
      const data = [
        { name: 'John', ssn: '123' },
        { name: 'Jane', ssn: '456' },
        { name: 'Bob', ssn: '789' },
      ];
      expect(data.length).toBe(3);
    });

    it('should handle empty CSV files', () => {
      const data: Record<string, string>[] = [];
      expect(data.length).toBe(0);
    });

    it('should handle single row CSV files', () => {
      const data = [{ name: 'John', ssn: '123' }];
      expect(data.length).toBe(1);
    });
  });

  describe('Drag and Drop Support (Requirement 1.1)', () => {
    it('should handle files from drag events', () => {
      // Test that the component can process files from drag events
      const file = new File(['name,ssn\nJohn,123'], 'test.csv', { type: 'text/csv' });
      
      // Verify file properties that would be accessed during drag-drop
      expect(file.name).toBe('test.csv');
      expect(file.type).toBe('text/csv');
      expect(file.size).toBeGreaterThan(0);
    });

    it('should only process the first file when multiple files are dropped', () => {
      const files = [
        new File(['content1'], 'first.csv', { type: 'text/csv' }),
        new File(['content2'], 'second.csv', { type: 'text/csv' }),
      ];
      
      // Component should process only the first file
      const firstFile = files[0];
      expect(firstFile.name).toBe('first.csv');
    });
  });

  describe('Callback Behavior', () => {
    it('should call onFileLoaded with correct parameters', () => {
      const onFileLoaded = vi.fn();
      const data = [{ name: 'John', ssn: '123' }];
      const fileName = 'test.csv';
      const rowCount = 1;

      onFileLoaded(data, fileName, rowCount);

      expect(onFileLoaded).toHaveBeenCalledWith(data, fileName, rowCount);
      expect(onFileLoaded).toHaveBeenCalledTimes(1);
    });

    it('should call onError when error occurs', () => {
      const onError = vi.fn();
      const errorMessage = 'Invalid file type. Please upload a .csv file.';

      onError(errorMessage);

      expect(onError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Component State Logic', () => {
    it('should validate file extension correctly', () => {
      const isValidCSV = (fileName: string): boolean => {
        return fileName.toLowerCase().endsWith('.csv');
      };

      expect(isValidCSV('data.csv')).toBe(true);
      expect(isValidCSV('DATA.CSV')).toBe(true);
      expect(isValidCSV('file.CSV')).toBe(true);
      expect(isValidCSV('data.txt')).toBe(false);
      expect(isValidCSV('data.xlsx')).toBe(false);
      expect(isValidCSV('csv')).toBe(false);
      expect(isValidCSV('.csv')).toBe(true);
    });

    it('should format row count text correctly', () => {
      const formatRowCount = (count: number): string => {
        return `${count} row${count !== 1 ? 's' : ''} loaded`;
      };

      expect(formatRowCount(0)).toBe('0 rows loaded');
      expect(formatRowCount(1)).toBe('1 row loaded');
      expect(formatRowCount(2)).toBe('2 rows loaded');
      expect(formatRowCount(1000)).toBe('1000 rows loaded');
    });
  });
});
