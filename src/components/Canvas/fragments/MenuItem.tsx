'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
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
    onClick={onClick}
    className={clsx(
      'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] tracking-tight transition-colors',
      accent === 'emerald' && 'text-emerald-700 hover:bg-emerald-500/10',
      accent === 'red' && 'text-red-600 hover:bg-red-500/10',
      accent === 'cyan' && 'text-cyan-700 hover:bg-cyan-500/10',
      accent === 'neutral' && 'text-neutral-700 hover:bg-black/[0.05]'
    )}
  >
    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">{icon}</span>

    <span className="flex-1 truncate">{label}</span>

    {shortcut && <span className="font-mono text-[9.5px] tracking-wider text-neutral-400">{shortcut}</span>}
  </button>
);

export const MenuDivider = () => <div className="my-1 h-px bg-black/[0.06]" aria-hidden />;
