import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ITriggerExampleProps {
  children: ReactNode;
  className?: string;
}

export const TriggerExample = ({ children, className }: ITriggerExampleProps) => (
  <button
    type="button"
    className={clsx(
      'rounded-lg border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-[13px] text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-overlay)]',
      className,
    )}
  >
    {children}
  </button>
);
