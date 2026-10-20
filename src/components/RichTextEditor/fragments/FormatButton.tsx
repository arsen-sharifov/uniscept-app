'use client';

import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

interface IFormatButtonProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  active?: boolean;
  iconStyle?: CSSProperties;
  onClick: () => void;
}

export const FormatButton = ({ icon: Icon, label, shortcut, active, iconStyle, onClick }: IFormatButtonProps) => (
  <button
    type="button"
    aria-label={label}
    aria-pressed={active}
    title={shortcut ? `${label} ${shortcut}` : label}
    onClick={onClick}
    className={clsx(
      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none',
      active
        ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
        : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]',
    )}
  >
    <Icon aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} style={iconStyle} />
  </button>
);
