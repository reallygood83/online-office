'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-bold mb-2 text-[#1A1A2E]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            neo-input w-full px-4 py-3 rounded-lg text-[#1A1A2E]
            placeholder:text-gray-400
            ${error ? 'border-[#FF6B6B]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[#FF6B6B] font-semibold">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
