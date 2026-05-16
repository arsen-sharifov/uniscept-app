'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface IItemActionsToolbarProps {
  isActive: boolean;
  isSelected: boolean;
  children: ReactNode;
}

export const ItemActionsToolbar = ({ isActive, isSelected, children }: IItemActionsToolbarProps) => (
  <div
    onClick={(event) => event.stopPropagation()}
    onPointerDown={(event) => event.stopPropagation()}
    className={clsx(
      'pointer-events-none absolute top-1/2 right-1 z-10 flex translate-x-2 -translate-y-1/2 items-center gap-0.5 rounded-lg py-0.5 pr-0.5 pl-5 opacity-0 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.12)] ring-1 backdrop-blur-md transition-[opacity,transform] duration-200 ease-out',
      '[mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0px,black_20px,black_100%)]',
      'group-hover/item:pointer-events-auto group-hover/item:translate-x-0 group-hover/item:opacity-100',
      isActive || isSelected
        ? 'bg-[color:var(--accent-soft)] ring-[color:var(--border-active)]'
        : 'bg-[color:var(--surface-elevated)]/98 ring-[color:var(--border)]'
    )}
  >
    {children}
  </div>
);
