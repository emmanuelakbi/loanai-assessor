import React, { useCallback, useState, useRef } from 'react';
import Papa from 'papaparse';
import { validateCSVData } from '../../services/csvValidator';

export interface CSVDropzoneProps {
  /** Callback when a valid CSV file is parsed */
  onFileLoaded: (data: Record<string, string>[], fileName: string, rowCount: number) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Whether the dropzone is disabled */
  disabled?: boolean;
}

interface FileInfo {
  fileName: string;
  rowCount: number;
}

/**
 * CSVDropzone - File upload component with drag-and-drop support for CSV files
 * 
 * Requirements:
 * - 1.1: Display a CSV upload dropzone with drag-and-drop
 * - 1.2: Accept .csv files only
 * - 1.3: Validate required columns: name, ssn, annual_income, total_assets, company, industry
 * - 1.4: Display filename and row count when valid CSV uploaded
 * - 1.5: Display error message if CSV missing columns
 */
export const CSVDropzone: React.FC<CSVDropzoneProps> = ({
  onFileLoaded,
  onError,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setFileInfo(null);
    onError?.(errorMessage);
  }, [onError]);

  const processFile = useCallback((file: File) => {
    // Validate file type - accept .csv files only (Requirement 1.2)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      handleError('Invalid file type. Please upload a .csv file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsLoading(false);
        
        if (results.errors.length > 0) {
          handleError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const data = results.data;
        
        // Validate required columns (Requirements 1.3, 1.5)
        const validationResult = validateCSVData(data);
        if (!validationResult.isValid) {
          handleError(validationResult.errorMessage || 'CSV validation failed');
          return;
        }

        const rowCount = data.length;

        // Display filename and row count (Requirement 1.4)
        setFileInfo({
          fileName: file.name,
          rowCount,
        });

        onFileLoaded(data, file.name, rowCount);
      },
      error: (error) => {
        setIsLoading(false);
        handleError(`Failed to parse CSV: ${error.message}`);
      },
    });
  }, [onFileLoaded, handleError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleClearFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFileInfo(null);
    setError(null);
  }, []);

  return (
    <div className="w-full">
      <div
        data-testid="csv-dropzone"
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload CSV file"
        aria-disabled={disabled}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out min-h-[150px]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${fileInfo ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
          data-testid="csv-file-input"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Processing CSV file...</p>
          </div>
        ) : fileInfo ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-medium" data-testid="csv-filename">
                {fileInfo.fileName}
              </p>
              <p className="text-gray-600 text-sm" data-testid="csv-row-count">
                {fileInfo.rowCount} row{fileInfo.rowCount !== 1 ? 's' : ''} loaded
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearFile}
              className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
              data-testid="csv-clear-button"
            >
              Upload a different file
            </button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600" data-testid="csv-error">
              {error}
            </p>
            <p className="text-gray-500 text-sm">
              Click or drag to try again
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-gray-500 text-sm mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-gray-400 text-xs">
              Accepts .csv files only
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVDropzone;
