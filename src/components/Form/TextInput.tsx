import React, { useId } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
}) => {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="mb-4">
      <label 
        htmlFor={inputId}
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
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
