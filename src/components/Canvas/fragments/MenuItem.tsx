'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import type { TMenuItemAccent } from '@interfaces';

interface IMenuItemProps {
  icon: ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  accent?: TMenuItemAccent;
}

export const MenuItem = ({ icon, label, shortcut, onClick, accent = 'neutral' }: IMenuItemProps) => (
  <button
    type="button"
    role="menuitem"
    tabIndex={-1}
    onClick={onClick}
    className={clsx(
      'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] tracking-tight transition-colors focus:outline-none focus-visible:bg-[color:var(--surface-overlay)]',
      accent === 'emerald' && 'text-[color:var(--status-success)] hover:bg-[color:var(--status-success-soft)]',
      accent === 'red' && 'text-[color:var(--status-error)] hover:bg-[color:var(--status-error-soft)]',
      accent === 'cyan' && 'text-[color:var(--ref)] hover:bg-[color:var(--ref-soft)]',
      accent === 'neutral' && 'text-[color:var(--text)] hover:bg-[color:var(--surface-overlay)]',
    )}
  >
    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">{icon}</span>

    <span className="flex-1 truncate">{label}</span>

    {shortcut && (
      <span className="font-mono text-[9.5px] tracking-wider text-[color:var(--text-subtle)]">{shortcut}</span>
    )}
  </button>
);

export const MenuDivider = () => <div className="my-1 h-px bg-[color:var(--border)]" aria-hidden />;
