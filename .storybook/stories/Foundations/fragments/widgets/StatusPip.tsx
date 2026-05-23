import { clsx } from 'clsx';

import type { TStatusTone } from '@story-interfaces';

interface IStatusPipProps {
  label: string;
  tone: TStatusTone;
}

export const StatusPip = ({ label, tone }: IStatusPipProps) => (
  <span
    className={clsx(
      'flex items-center justify-center rounded-md px-2 py-1 font-mono text-[9.5px] font-semibold tracking-[0.18em] uppercase ring-1',
      tone === 'success' &&
        'bg-[color:var(--status-success-bg)] text-[color:var(--status-success)] ring-[color:var(--status-success-border)]',
      tone === 'warning' &&
        'bg-[color:var(--status-warning-bg)] text-[color:var(--status-warning)] ring-[color:var(--status-warning-border)]',
      tone === 'error' &&
        'bg-[color:var(--status-error-bg)] text-[color:var(--status-error)] ring-[color:var(--status-error-border)]',
    )}
  >
    {label}
  </span>
);
