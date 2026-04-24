'use client';
import { Search } from 'lucide-react';
import { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClass?: string;
}

export function SearchBar({ containerClass, className, ...props }: SearchBarProps) {
  return (
    <div className={clsx('relative', containerClass)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-eco-gray" />
      <input
        className={clsx(
          'w-full rounded-lg border border-eco-border bg-white py-2 pl-9 pr-3 text-sm text-eco-text',
          'placeholder:text-eco-gray-lt focus:border-eco-green focus:outline-none focus:ring-1 focus:ring-eco-green',
          className,
        )}
        {...props}
      />
    </div>
  );
}
