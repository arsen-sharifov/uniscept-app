'use client';

import { useEffect } from 'react';

import { useCanvasStore } from '@/lib/stores';

const MIDDLE_MOUSE_BUTTON = 1;

export const useMiddlePan = (): void => {
  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (event.button !== MIDDLE_MOUSE_BUTTON) return;

      event.preventDefault();
      useCanvasStore.getState().setMiddlePan(true);
    };

    const onUp = (event: MouseEvent) => {
      if (event.button !== MIDDLE_MOUSE_BUTTON) return;

      useCanvasStore.getState().setMiddlePan(false);
    };

    const onAuxClick = (event: MouseEvent) => {
      if (event.button === MIDDLE_MOUSE_BUTTON) event.preventDefault();
    };

    const onBlur = () => useCanvasStore.getState().setMiddlePan(false);

    const captureOptions = { capture: true } as const;

    window.addEventListener('mousedown', onDown, captureOptions);
    window.addEventListener('mouseup', onUp, captureOptions);
    window.addEventListener('auxclick', onAuxClick, captureOptions);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('mousedown', onDown, captureOptions);
      window.removeEventListener('mouseup', onUp, captureOptions);
      window.removeEventListener('auxclick', onAuxClick, captureOptions);
      window.removeEventListener('blur', onBlur);
    };
  }, []);
};
