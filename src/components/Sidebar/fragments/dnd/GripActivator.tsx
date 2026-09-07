'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { clsx } from 'clsx';
import { GripVertical } from 'lucide-react';

interface IGripActivatorProps {
  setActivatorRef: (element: HTMLElement | null) => void;
  attributes: DraggableAttributes;
  listeners: DraggableSyntheticListeners;
  isActive: boolean;
  ariaLabel: string;
}

export const GripActivator = ({ setActivatorRef, attributes, listeners, isActive, ariaLabel }: IGripActivatorProps) => (
  <span
    ref={setActivatorRef}
    {...attributes}
    {...listeners}
    aria-label={ariaLabel}
    role="button"
    tabIndex={-1}
    data-dnd-grip
    className={clsx(
      'pointer-events-none absolute inset-0 flex cursor-grab touch-none items-center justify-center rounded-lg opacity-0 transition-opacity duration-150 select-none active:cursor-grabbing motion-reduce:transition-none',
      'group-hover/item:pointer-events-auto group-hover/item:opacity-100',
      'focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none',
      isActive
        ? 'text-[color:var(--accent-text)]'
        : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)] active:text-[color:var(--accent-text)]',
    )}
  >
    <GripVertical className="h-3 w-3" strokeWidth={2.5} />
  </span>
);
