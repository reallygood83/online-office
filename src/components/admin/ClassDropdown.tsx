'use client';

import { useState, useRef, useEffect } from 'react';
import { SUBJECT_COLORS } from '@/types';
import { ALL_CLASSES } from '@/data/scheduleData';

interface ClassDropdownProps {
  value: string | null;
  options: string[];
  subject: string;
  hasConflict?: boolean;
  onChange: (className: string | null) => void;
  disabled?: boolean;
  additionalSubjects?: string[];
}

export default function ClassDropdown({
  value,
  options,
  subject,
  hasConflict = false,
  onChange,
  disabled = false,
  additionalSubjects = [],
}: ClassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const bgColor = SUBJECT_COLORS[subject] || 'bg-gray-200';
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (className: string | null) => {
    onChange(className);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-w-[72px] h-12 px-2 py-1
          font-bold text-sm
          border-3 border-black rounded-lg
          transition-all duration-150
          flex items-center justify-center gap-1
          ${value ? bgColor : 'bg-white'}
          ${hasConflict ? 'ring-4 ring-red-500 border-red-500' : ''}
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'shadow-neo-sm hover:shadow-neo-pressed hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer'
          }
        `}
      >
        <span className="truncate">{value || '-'}</span>
        {hasConflict && (
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {!disabled && (
          <svg 
            className={`w-3 h-3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[120px] bg-white border-3 border-black rounded-lg shadow-neo-md overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`
                w-full px-3 py-2 text-left font-medium text-sm
                hover:bg-gray-100 border-b-2 border-black
                ${!value ? 'bg-gray-200' : ''}
              `}
            >
              비어있음
            </button>
            {options.map((className) => (
              <button
                key={className}
                type="button"
                onClick={() => handleSelect(className)}
                className={`
                  w-full px-3 py-2 text-left font-medium text-sm
                  hover:bg-gray-100 border-b border-gray-200 last:border-b-0
                  ${value === className ? bgColor : ''}
                `}
              >
                {className}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
