import React, { useId } from 'react';

interface SSNInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

export const SSNInput: React.FC<SSNInputProps> = ({
  value,
  onChange,
  onBlur,
  error,
}) => {
  const inputId = useId();
  const errorId = useId();

  // Format SSN with dashes: XXX-XX-XXXX, showing only last 4 digits
  const formatDisplayValue = (rawValue: string): string => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 9);
    if (digits.length === 0) return '';
    
    // Mask first 5 digits, show last 4
    const masked = digits.split('').map((char, index) => {
      if (index < 5 && digits.length > index) return 'X';
      return char;
    }).join('');
    
    // Insert dashes
    if (masked.length <= 3) return masked;
    if (masked.length <= 5) return `${masked.slice(0, 3)}-${masked.slice(3)}`;
    return `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Extract only digits from input
    const newDigits = input.replace(/\D/g, '').slice(0, 9);
    onChange(newDigits);
  };

  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId}
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        SSN<span className="text-error"> *</span>
      </label>
      <input
        id={inputId}
        type="text"
        value={formatDisplayValue(value)}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder="XXX-XX-XXXX"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          h-12 w-full px-3 text-base rounded-lg border
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary
          ${error 
            ? 'border-error focus:ring-error' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      />
      {error && (
        <div id={errorId} className="text-error text-xs mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
