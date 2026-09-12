'use client';

import { Download, LoaderCircle } from 'lucide-react';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import type { TCanvasExportFormat } from '@interfaces';
import { useAsyncAction, useClickOutside, useEscapeKey, useMenuKeyboardNavigation } from '@hooks';
import { useTranslations } from '@/i18n';
import { useCanvasStore } from '@/lib/stores';

import { EXPORT_FORMATS, ICON_STROKE } from '../consts';

interface IExportMenuProps {
  threadId: string;
  threadName: string;
}

export const ExportMenu = ({ threadId, threadName }: IExportMenuProps) => {
  const t = useTranslations();
  const copy = t.platform.canvas.export;
  const hydrated = useCanvasStore((state) => state.hydrated);
  const activeThreadId = useCanvasStore((state) => state.threadId);
  const hasNodes = useCanvasStore((state) => state.nodes.length > 0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const keyboardRef = useRef(false);
  const restoreFocusRef = useRef(false);
  const menuId = useId();
  const { loading, error, run, setError } = useAsyncAction();
  const { focusItem, handleKeyDown } = useMenuKeyboardNavigation(menuRef);
  const disabled = !hydrated || activeThreadId !== threadId || !hasNodes;

  const close = () => {
    restoreFocusRef.current = true;
    setOpen(false);
  };

  useClickOutside(rootRef, () => setOpen(false), open);
  useEscapeKey(close, open);

  useEffect(() => {
    openRef.current = open;
    if (!open) return;
    if (keyboardRef.current) focusItem(0);
    else menuRef.current?.focus();
  }, [open, focusItem]);

  useEffect(() => {
    if (open || loading || !restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    buttonRef.current?.focus();
  }, [open, loading]);

  const exportFormat = (format: TCanvasExportFormat) => {
    if (disabled) return;
    void run(async () => {
      const root = document.querySelector<HTMLElement>(`[data-canvas-thread="${CSS.escape(threadId)}"]`);
      if (!root) throw new Error('The active canvas is unavailable');
      const { exportCanvas } = await import('@/lib/canvas/export');
      const outcome = await exportCanvas(root, threadName, format);
      if (outcome === 'too-large') {
        setError(copy.tooLarge);

        return;
      }
      if (openRef.current) close();
    }, copy.error);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') setOpen(false);
    else handleKeyDown(event);
  };

  return (
    <div ref={rootRef} className="relative flex justify-center">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled || loading}
        aria-label={loading ? copy.loading : copy.label}
        title={disabled ? copy.unavailable : copy.label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setError(null);
          setOpen((previous) => !previous);
        }}
        onPointerDown={() => {
          keyboardRef.current = false;
        }}
        onKeyDown={(event) => {
          keyboardRef.current = true;
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
      >
        {loading ? (
          <LoaderCircle
            className="h-[17px] w-[17px] animate-spin motion-reduce:animate-none"
            strokeWidth={ICON_STROKE}
          />
        ) : (
          <Download className="h-[17px] w-[17px]" strokeWidth={ICON_STROKE} />
        )}
      </button>

      {open && (
        <div className="absolute right-full bottom-0 z-50 mr-3 w-64 max-w-[calc(100vw-6rem)] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-[color:var(--text)] shadow-[var(--shadow-modal)]">
          <p className="px-2 pt-1 text-[13px] font-semibold">{copy.label}</p>
          <p className="px-2 pt-1 pb-2 text-xs leading-relaxed text-[color:var(--text-muted)]">{copy.description}</p>
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={copy.label}
            aria-busy={loading}
            onKeyDown={handleMenuKeyDown}
            className="outline-none"
          >
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format}
                type="button"
                role="menuitem"
                disabled={loading || disabled}
                onClick={() => exportFormat(format)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left text-[13px] transition-colors hover:bg-[color:var(--surface-overlay)] focus-visible:bg-[color:var(--surface-overlay)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none"
              >
                <span className="font-semibold">{format.toUpperCase()}</span>
                <span className="text-xs text-[color:var(--text-muted)]">{copy.formats[format]}</span>
              </button>
            ))}
          </div>
          {loading && (
            <p role="status" className="px-2 pt-2 text-xs text-[color:var(--text-muted)]">
              {copy.loading}
            </p>
          )}
          {error && (
            <p role="alert" className="px-2 pt-2 text-xs leading-relaxed text-[color:var(--status-error)]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
