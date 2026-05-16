'use client';

import { type MouseEvent, type ReactNode, type TransitionEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useFocusTrap, useTranslations } from '@hooks';
import { adjustScrollLock } from './utils';

export interface IModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  width?: string;
  overflowHidden?: boolean;
}

export const Modal = ({ open, onClose, children, className, width = 'max-w-lg', overflowHidden }: IModalProps) => {
  const t = useTranslations();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  const [showing, setShowing] = useState(open);
  if (open && !showing) {
    setShowing(true);
  }

  useFocusTrap(panelRef, open);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    panelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    adjustScrollLock(1);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      adjustScrollLock(-1);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  if (!showing) {
    return null;
  }

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target === e.currentTarget && !open) {
      setShowing(false);
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm transition-opacity duration-200 ease-out starting:opacity-0',
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={clsx(
          'relative max-h-[90vh] w-full rounded-2xl bg-[color:var(--surface)] text-[color:var(--text)] shadow-[var(--shadow-modal)] transition-all duration-200 ease-out outline-none starting:translate-y-2 starting:scale-95 starting:opacity-0',
          open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
          width,
          overflowHidden ? 'overflow-hidden' : 'overflow-y-auto',
          className
        )}
      >
        {!overflowHidden && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-lg p-1.5 text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
};
