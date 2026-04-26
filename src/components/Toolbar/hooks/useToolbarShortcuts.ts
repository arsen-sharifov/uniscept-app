'use client';

import { useEffect } from 'react';
import { ECanvasTool } from '@/components/tools';
import { useCanvasStore } from '@/lib/stores';

const SINGLE_KEY_MAP: Record<string, ECanvasTool> = {
  v: ECanvasTool.Select,
  h: ECanvasTool.Pan,
  n: ECanvasTool.AddNode,
  c: ECanvasTool.Connect,
  d: ECanvasTool.Delete,
  y: ECanvasTool.ValidPath,
  x: ECanvasTool.InvalidPath,
  r: ECanvasTool.CrossReference,
};

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

export const useToolbarShortcuts = (enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          useCanvasStore.getState().redo();
        } else {
          useCanvasStore.getState().undo();
        }
        return;
      }

      if (event.altKey || event.metaKey || event.ctrlKey) return;

      const tool = SINGLE_KEY_MAP[key];
      if (!tool) return;

      event.preventDefault();
      useCanvasStore.getState().setActiveTool(tool);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
};
