import { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Table({ children, className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-eco-border">
      <table className={clsx('w-full text-sm', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-eco-green-bg text-eco-text-2" {...props}>
      {children}
    </thead>
  );
}

export function Th({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={clsx('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider', className)} {...props}>
      {children}
    </th>
  );
}

export function Tbody({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className="divide-y divide-eco-border bg-white" {...props}>
      {children}
    </tbody>
  );
}

export function Tr({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={clsx('hover:bg-eco-bg transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function Td({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={clsx('px-4 py-3 text-eco-text', className)} {...props}>
      {children}
    </td>
  );
}
