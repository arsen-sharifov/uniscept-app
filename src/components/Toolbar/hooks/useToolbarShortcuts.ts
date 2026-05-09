'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '@/lib/stores';
import { TOOL_KEY_MAP } from '../consts';
import { isToolDisabled, isTypingTarget } from '../utils';

export const useToolbarShortcuts = (): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const isModifier = event.metaKey || event.ctrlKey;
      const store = useCanvasStore.getState();
      const temporal = useCanvasStore.temporal.getState();

      if (isModifier && key === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          if (temporal.futureStates.length > 0) store.redo();
          return;
        }

        if (temporal.pastStates.length > 0) store.undo();
        return;
      }

      if (event.altKey || isModifier) return;

      const tool = TOOL_KEY_MAP[key];
      if (!tool) return;

      const disabled = isToolDisabled(tool, {
        canUndo: temporal.pastStates.length > 0,
        canRedo: temporal.futureStates.length > 0,
      });
      if (disabled) return;

      event.preventDefault();
      store.setActiveTool(tool);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
};
