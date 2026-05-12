'use client';

import { useSyncExternalStore } from 'react';
import { CANVAS_PATTERN_VALUES, DEFAULT_PREFERENCES } from '@constants';
import type { TCanvasPattern } from '@interfaces';

const subscribers = new Set<() => void>();
let observer: MutationObserver | null = null;

const isCanvasPattern = (value: string | null): value is TCanvasPattern =>
  value !== null && CANVAS_PATTERN_VALUES.includes(value as TCanvasPattern);

const readPattern = (): TCanvasPattern => {
  if (typeof document === 'undefined') {
    return DEFAULT_PREFERENCES.canvasPattern;
  }

  const value = document.documentElement.getAttribute('data-canvas-pattern');

  return isCanvasPattern(value) ? value : DEFAULT_PREFERENCES.canvasPattern;
};

const subscribe = (notify: () => void) => {
  subscribers.add(notify);

  if (!observer && typeof document !== 'undefined') {
    observer = new MutationObserver(() => subscribers.forEach((cb) => cb()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-canvas-pattern'] });
  }

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
};

export const useCanvasPattern = (): TCanvasPattern =>
  useSyncExternalStore(subscribe, readPattern, () => DEFAULT_PREFERENCES.canvasPattern);
