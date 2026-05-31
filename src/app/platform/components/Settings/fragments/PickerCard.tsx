'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface IPickerCardProps {
  active: boolean;
  label: string;
  onSelect: () => void;
  children: ReactNode;
  variant?: 'glyph' | 'initials';
}

export const PickerCard = ({ active, label, onSelect, children, variant = 'glyph' }: IPickerCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    aria-label={label}
    title={label}
    onClick={onSelect}
    className={clsx(
      'group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-[border-color,transform,box-shadow] duration-300 ease-out',
      'hover:-translate-y-0.5',
      'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
      variant === 'initials' && !active && 'border-dashed',
      active && 'border-[color:var(--border-active)] shadow-[0_18px_38px_-22px_var(--accent-glow)]',
      !active &&
        variant === 'initials' &&
        'border-[color:var(--border-strong)] hover:border-[color:var(--text-subtle)] hover:shadow-[var(--shadow-card-hover)]',
      !active &&
        variant === 'glyph' &&
        'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    )}
  >
    <div
      aria-hidden
      className="relative flex h-11 w-full items-center justify-center bg-[color:var(--surface-overlay)] text-[color:var(--text-strong)]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(140% 90% at 50% 0%, color-mix(in srgb, var(--accent-soft) 30%, transparent) 0%, transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>

    <div className="flex flex-col gap-1 bg-[color:var(--surface-elevated)] px-1.5 pt-1.5 pb-2">
      <span className="block truncate text-center font-serif text-[12.5px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
        {label}
      </span>
    </div>

    <span
      aria-hidden={!active}
      className={clsx(
        'absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] transition-[opacity,transform] duration-300 ease-out',
        active ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    >
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>

    <span
      aria-hidden
      className={clsx(
        'pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-300',
        active ? 'bg-gradient-to-r from-transparent via-[color:var(--accent)] to-transparent opacity-90' : 'opacity-0',
      )}
    />
  </button>
);
