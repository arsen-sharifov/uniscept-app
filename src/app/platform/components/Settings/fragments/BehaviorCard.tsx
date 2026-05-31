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
      'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left',
      'transition-[border-color,transform,box-shadow] duration-300 ease-out',
      'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
      'hover:-translate-y-0.5',
      checked
        ? 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]'
        : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    )}
  >
    <div className="relative h-20 w-full overflow-hidden bg-[color:var(--surface-overlay)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent-soft) 40%, transparent) 0%, transparent 70%)',
        }}
      />
      {diorama}
    </div>

    <div className="flex flex-col gap-1 bg-[color:var(--surface-elevated)] px-3.5 pt-2.5 pb-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-serif text-[16px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
          {label}
        </span>
        <span
          aria-hidden={!checked}
          className={clsx(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[opacity,transform] duration-300 ease-out',
            checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        >
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      </div>
      <span className="text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
        {description}
      </span>
    </div>

    <span
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
        checked ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90' : 'opacity-0',
      )}
    />
  </button>
);
