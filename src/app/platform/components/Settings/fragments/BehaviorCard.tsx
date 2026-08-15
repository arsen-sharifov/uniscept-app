'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface IBehaviorCardProps {
  diorama: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

export const BehaviorCard = ({ diorama, label, description, checked, onChange }: IBehaviorCardProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    data-state={checked ? 'on' : 'off'}
    className={clsx(
      'group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left',
      'transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out',
      'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
      'hover:-translate-y-0.5 active:translate-y-0',
      'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      checked
        ? 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]'
        : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    )}
  >
    <div className="relative h-20 w-full overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--surface-soft)]">
      {diorama}
    </div>

    <div className={clsx('flex flex-col gap-1 px-3.5 pt-2.5 pb-3', !checked && 'bg-[color:var(--surface-elevated)]')}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-grotesk text-[16px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
          {label}
        </span>
        <span
          aria-hidden={!checked}
          className={clsx(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      </div>
      <span className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
        {description}
      </span>
    </div>
  </button>
);
