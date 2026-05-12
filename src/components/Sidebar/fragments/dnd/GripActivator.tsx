'use client';

import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { clsx } from 'clsx';

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
      'pointer-events-none absolute inset-0 flex cursor-grab touch-none items-center justify-center opacity-0 transition-opacity duration-150 select-none active:cursor-grabbing',
      'group-hover/item:pointer-events-auto group-hover/item:opacity-100',
      isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text)]'
    )}
  >
    <GripVertical className="h-3 w-3" strokeWidth={2.5} />
  </span>
);
