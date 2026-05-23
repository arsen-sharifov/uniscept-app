'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

export interface IToggleProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Toggle = ({ icon: Icon, label, description, checked, onChange, disabled }: IToggleProps) => (
  <div className={clsx('flex items-center gap-3', disabled && 'opacity-50')}>
    <Icon className="h-4 w-4 shrink-0 text-[color:var(--text-subtle)]" />
    <div className="flex-1">
      <span className="text-sm font-medium text-[color:var(--text)]">{label}</span>
      <p className="text-xs text-[color:var(--text-subtle)]">{description}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={clsx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        checked ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--surface-overlay)]',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-[color:var(--on-accent)] shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  </div>
);
