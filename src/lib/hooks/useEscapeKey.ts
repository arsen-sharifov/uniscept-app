'use client';

import { useEffect } from 'react';

export const useEscapeKey = (onEscape: () => void, enabled: boolean = true): void => {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onEscape();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onEscape, enabled]);
};
