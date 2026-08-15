'use client';

import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface IPickerCardProps {
  active: boolean;
  label: string;
  onSelect: () => void;
  children: ReactNode;
  variant?: 'icon' | 'initials';
}

export const PickerCard = ({ active, label, onSelect, children, variant = 'icon' }: IPickerCardProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    aria-label={label}
    title={label}
    onClick={onSelect}
    className={clsx(
      'group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out',
      'hover:-translate-y-0.5 active:translate-y-0',
      'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] focus-visible:outline-none',
      'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      variant === 'initials' && !active && 'border-dashed',
      active && 'border-[color:var(--border-active)] bg-[color:var(--accent-soft)]',
      !active &&
        variant === 'initials' &&
        'border-[color:var(--border-strong)] hover:border-[color:var(--text-subtle)] hover:shadow-[var(--shadow-card-hover)]',
      !active &&
        variant === 'icon' &&
        'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-card-hover)]',
    )}
  >
    <div
      aria-hidden
      className="relative flex h-11 w-full items-center justify-center border-b border-[color:var(--border)] bg-[color:var(--surface-soft)] text-[color:var(--text-strong)]"
    >
      <div className="relative">{children}</div>
    </div>

    <div className={clsx('flex flex-col gap-1 px-1.5 pt-1.5 pb-2', !active && 'bg-[color:var(--surface-elevated)]')}>
      <span className="block truncate text-center font-grotesk text-[12.5px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
        {label}
      </span>
    </div>

    <span
      aria-hidden={!active}
      className={clsx(
        'absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[var(--shadow-pip)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
        active ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
      )}
    >
      <Check className="h-2.5 w-2.5" strokeWidth={3} />
    </span>
  </button>
);
