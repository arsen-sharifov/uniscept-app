'use client';

import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface IToggleProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Toggle = ({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
}: IToggleProps) => (
  <div className={clsx('flex items-center gap-3', disabled && 'opacity-50')}>
    <Icon className="h-4 w-4 shrink-0 text-black/30" />
    <div className="flex-1">
      <span className="text-sm font-medium text-black/60">{label}</span>
      <p className="text-xs text-black/30">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={clsx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        checked ? 'bg-emerald-500' : 'bg-black/10'
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);
