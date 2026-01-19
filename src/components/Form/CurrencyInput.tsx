import React, { useId } from 'react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
}) => {
  const inputId = useId();
  const errorId = useId();

  // Format number with comma separators
  const formatCurrency = (num: number): string => {
    if (num === 0 || isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove all non-digit characters
    const digits = input.replace(/[^\d]/g, '');
    const numValue = digits ? parseInt(digits, 10) : 0;
    onChange(numValue);
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId}
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      <div className="relative">
        <span 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none"
          aria-hidden="true"
        >
          $
        </span>
        <input
          id={inputId}
          type="text"
          value={formatCurrency(value)}
          onChange={handleChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            h-12 w-full pl-7 pr-3 text-base rounded-lg border
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary
            ${error 
              ? 'border-error focus:ring-error' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
      </div>
      {error && (
        <div id={errorId} className="text-error text-xs mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
