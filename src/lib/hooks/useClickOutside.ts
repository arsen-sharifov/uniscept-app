'use client';

import { useEffect, type RefObject } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  enabled: boolean = true,
): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (node.contains(event.target)) {
        return;
      }

      onOutside();
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [ref, onOutside, enabled]);
};
