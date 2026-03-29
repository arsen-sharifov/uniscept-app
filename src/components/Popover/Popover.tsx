'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import type { TPopoverPlacement } from '@interfaces';
import { useMounted } from '@hooks';

interface IPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  placement?: TPopoverPlacement;
  offset?: number;
  className?: string;
  panelClassName?: string;
  triggerClassName?: string;
  children: ReactNode;
}

export const Popover = ({
  open,
  onOpenChange,
  trigger,
  placement = 'bottom-start',
  offset = 8,
  panelClassName,
  triggerClassName,
  children,
}: IPopoverProps) => {
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const mounted = useMounted();

  useLayoutEffect(() => {
    if (!open) return;
    const triggerEl = triggerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !panelEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const panelWidth = panelEl.offsetWidth || rect.width;

    panelEl.style.position = 'fixed';
    panelEl.style.zIndex = '50';
    panelEl.style.minWidth = `${rect.width}px`;

    if (placement.startsWith('bottom')) {
      panelEl.style.top = `${rect.bottom + offset}px`;
      panelEl.style.bottom = '';
    } else {
      panelEl.style.bottom = `${window.innerHeight - rect.top + offset}px`;
      panelEl.style.top = '';
    }
    if (placement.endsWith('start')) {
      panelEl.style.left = `${rect.left}px`;
    } else {
      panelEl.style.left = `${Math.max(8, rect.right - panelWidth)}px`;
    }
  });

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    const onResize = () => onOpenChange(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open, onOpenChange]);

  return (
    <>
      <div
        ref={triggerRef}
        className={triggerClassName}
        onClick={() => onOpenChange(!open)}
      >
        {trigger}
      </div>
      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            className={clsx(
              'overflow-hidden rounded-2xl border border-black/5 bg-white/95 shadow-2xl shadow-black/10 backdrop-blur-2xl',
              panelClassName
            )}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};
