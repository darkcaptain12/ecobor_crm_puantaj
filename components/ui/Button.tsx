import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        {
          'bg-eco-green text-white hover:bg-eco-green-dk': variant === 'primary',
          'bg-eco-green-bg text-eco-green hover:bg-eco-green hover:text-white': variant === 'secondary',
          'bg-red-50 text-eco-error hover:bg-eco-error hover:text-white': variant === 'danger',
          'text-eco-text-2 hover:bg-eco-green-bg hover:text-eco-green': variant === 'ghost',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-5 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;
