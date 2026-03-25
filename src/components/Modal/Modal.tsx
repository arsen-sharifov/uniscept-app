'use client';

import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface IModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overflowHidden?: boolean;
}

export const Modal = ({
  open,
  onClose,
  children,
  className,
  overflowHidden,
}: IModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCloseRef.current();
      };

      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        className={clsx(
          'relative max-h-[90vh] w-full max-w-[90vw] rounded-2xl bg-white shadow-xl',
          !className?.includes('max-w-') && 'max-w-lg',
          overflowHidden ? 'overflow-hidden' : 'overflow-y-auto',
          className
        )}
      >
        {!overflowHidden && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-lg p-1.5 text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
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
