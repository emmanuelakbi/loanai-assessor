import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import type { IndustrySector } from '../../types';

interface IndustrySelectProps {
  value: IndustrySector | '';
  onChange: (value: IndustrySector) => void;
  onBlur?: () => void;
  error?: string;
}

const INDUSTRY_OPTIONS: IndustrySector[] = [
  'Technology',
  'Healthcare',
  'Manufacturing',
  'Finance',
  'Energy',
  'Retail',
  'Agriculture',
  'Construction',
];

export const IndustrySelect: React.FC<IndustrySelectProps> = ({
  value,
  onChange,
  onBlur,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const selectId = useId();
  const listboxId = useId();
  const errorId = useId();

  const handleSelect = useCallback((option: IndustrySector) => {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    // Return focus to the select button
    selectRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          handleSelect(INDUSTRY_OPTIONS[highlightedIndex]);
        } else {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Set initial highlight to current value or first option
            const currentIndex = value ? INDUSTRY_OPTIONS.indexOf(value) : 0;
            setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const currentIndex = value ? INDUSTRY_OPTIONS.indexOf(value) : 0;
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
        } else {
          setHighlightedIndex((prev) => 
            prev < INDUSTRY_OPTIONS.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const currentIndex = value ? INDUSTRY_OPTIONS.indexOf(value) : INDUSTRY_OPTIONS.length - 1;
          setHighlightedIndex(currentIndex >= 0 ? currentIndex : INDUSTRY_OPTIONS.length - 1);
        } else {
          setHighlightedIndex((prev) => 
            prev > 0 ? prev - 1 : INDUSTRY_OPTIONS.length - 1
          );
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(INDUSTRY_OPTIONS.length - 1);
        }
        break;
    }
  }, [isOpen, highlightedIndex, value, handleSelect]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const highlightedOption = listboxRef.current.children[highlightedIndex] as HTMLElement;
      highlightedOption?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onBlur]);

  return (
    <div className="mb-4">
      <label 
        id={`${selectId}-label`}
        className="block mb-1 text-sm font-medium text-gray-700"
      >
        Industry Sector<span className="text-error"> *</span>
      </label>
      <div className="relative" ref={selectRef}>
        <div
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={`${selectId}-label`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-activedescendant={isOpen && highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined}
          tabIndex={0}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            // Only trigger onBlur if focus is leaving the entire component
            if (!selectRef.current?.contains(e.relatedTarget as Node)) {
              setTimeout(() => {
                setIsOpen(false);
                setHighlightedIndex(-1);
                onBlur?.();
              }, 150);
            }
          }}
          className={`
            h-12 px-3 w-full rounded-lg border bg-white cursor-pointer
            flex items-center justify-between
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary
            ${error 
              ? 'border-error focus:ring-error' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {value || 'Select industry...'}
          </span>
          <span 
            className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            ▼
          </span>
        </div>
        {isOpen && (
          <ul
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={`${selectId}-label`}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            {INDUSTRY_OPTIONS.map((option, index) => (
              <li
                key={option}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={value === option}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  px-3 py-3 cursor-pointer transition-colors duration-200
                  ${highlightedIndex === index ? 'bg-primary-100 text-primary' : 'hover:bg-gray-100'}
                  ${value === option ? 'font-medium bg-primary-50' : ''}
                `}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <div id={errorId} className="text-error text-xs mt-1" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
