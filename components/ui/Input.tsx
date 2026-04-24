'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-eco-text-2">{label}</label>}
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-lg border border-eco-border bg-white px-3 py-2 text-sm text-eco-text',
          'placeholder:text-eco-gray-lt focus:border-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green',
          error && 'border-eco-error focus:border-eco-error focus:ring-eco-error',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-eco-error">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
