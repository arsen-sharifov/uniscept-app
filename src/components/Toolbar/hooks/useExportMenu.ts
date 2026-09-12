'use client';

import { type MouseEvent, useEffect, useId, useRef, useState } from 'react';

import type { IExportMenuModel, TCanvasExportFormat, TCanvasExportOutcome, TMenuOpener } from '@interfaces';
import { useClickOutside, useEscapeKey, useMenuKeyboardNavigation } from '@hooks';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { useCanvasStore } from '@/lib/stores';

const runExport = async (
  threadId: string,
  threadName: string,
  format: TCanvasExportFormat,
): Promise<TCanvasExportOutcome> => {
  const root = document.querySelector<HTMLElement>(`[data-canvas-thread="${CSS.escape(threadId)}"]`);
  if (!root) throw new Error('The active canvas is unavailable');

  const { exportCanvas } = await import('@/lib/canvas/export');

  return exportCanvas(root, threadName, format);
};

export const useExportMenu = (threadId: string, threadName: string): IExportMenuModel => {
  const t = useTranslations();
  const hydrated = useCanvasStore((state) => state.hydrated);
  const activeThreadId = useCanvasStore((state) => state.threadId);
  const hasNodes = useCanvasStore((state) => state.nodes.length > 0);

  const [opener, setOpener] = useState<TMenuOpener | null>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);
  const menuId = useId();

  const open = opener !== null;
  const disabled = !hydrated || activeThreadId !== threadId || !hasNodes;

  const close = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setOpener(null);
  };

  const { focusItem, handleKeyDown } = useMenuKeyboardNavigation(menuRef, {
    onOpen: () => setOpener('keyboard'),
    onClose: () => close(false),
  });

  useClickOutside(rootRef, () => close(false), open);
  useEscapeKey(() => close(true), open);

  useEffect(() => {
    if (opener === 'keyboard') focusItem(0);
    if (opener === 'pointer') menuRef.current?.focus();
  }, [opener, focusItem]);

  useEffect(() => {
    if (open || loading || !restoreFocusRef.current) return;

    restoreFocusRef.current = false;
    buttonRef.current?.focus();
  }, [open, loading]);

  const toggle = (click: MouseEvent<HTMLButtonElement>) => {
    setHint(null);

    if (open) close(false);
    else setOpener(click.detail === 0 ? 'keyboard' : 'pointer');
  };

  const exportFormat = async (format: TCanvasExportFormat) => {
    if (disabled || loading) return;

    setLoading(true);
    setHint(null);

    const outcome = await runExport(threadId, threadName, format).catch((error: unknown) => {
      event.error(error, { title: t.common.errorTitles.exportFailed, context: 'canvas.export' });

      return null;
    });

    setLoading(false);
    if (outcome === 'too-large') setHint(t.platform.canvas.export.tooLarge);
    if (outcome === 'downloaded' && menuRef.current) close(true);
  };

  return {
    open,
    disabled,
    loading,
    hint,
    menuId,
    rootRef,
    buttonRef,
    menuRef,
    toggle,
    handleKeyDown,
    exportFormat,
  };
};
