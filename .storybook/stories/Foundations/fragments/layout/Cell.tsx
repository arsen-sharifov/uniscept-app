import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ICellProps {
  children: ReactNode;
  align?: 'left' | 'right';
  truncate?: boolean;
  className?: string;
}

export const Cell = ({ children, align = 'left', truncate = false, className }: ICellProps) => (
  <div
    className={clsx(
      'flex min-w-0 items-center',
      truncate && '[&>*]:truncate',
      align === 'right' && 'justify-end text-right',
      className,
    )}
  >
    {children}
  </div>
);
