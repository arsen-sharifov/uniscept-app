'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import type { TPopoverPlacement } from '@interfaces';
import { useEscapeKey, useMounted, useViewportChange } from '@hooks';

export interface IPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  placement?: TPopoverPlacement;
  offset?: number;
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

  const place = useCallback(() => {
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
  }, [placement, offset]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  const dismiss = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', onDocClick);

    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onOpenChange]);

  useEscapeKey(dismiss, open);
  useViewportChange({ onScroll: place, onResize: dismiss, enabled: open, capture: true });

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenChange(!open);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={triggerClassName}
        onClick={() => onOpenChange(!open)}
        onKeyDown={handleTriggerKeyDown}
      >
        {trigger}
      </div>
      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            tabIndex={-1}
            className={clsx(
              'overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/95 text-[color:var(--text)] shadow-2xl shadow-black/20 backdrop-blur-2xl outline-none',
              panelClassName,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
};
