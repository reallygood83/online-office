'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-[#FFE135] hover:bg-[#FFD700] text-[#1A1A2E]',
  secondary: 'bg-[#FF6B6B] hover:bg-[#FF5252] text-white',
  accent: 'bg-[#4ECDC4] hover:bg-[#3DBDB5] text-[#1A1A2E]',
  danger: 'bg-[#FF6B6B] hover:bg-[#FF5252] text-white',
  ghost: 'bg-white hover:bg-gray-100 text-[#1A1A2E]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          neo-button rounded-lg
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
