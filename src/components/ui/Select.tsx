'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold mb-2 text-[#1A1A2E]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            neo-select w-full px-4 py-3 rounded-lg text-[#1A1A2E]
            ${error ? 'border-[#FF6B6B]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-2 text-sm text-[#FF6B6B] font-semibold">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
