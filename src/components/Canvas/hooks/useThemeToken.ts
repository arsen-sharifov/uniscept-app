'use client';

import { useSyncExternalStore } from 'react';

const subscribers = new Set<() => void>();
let observer: MutationObserver | null = null;

const subscribe = (notify: () => void) => {
  subscribers.add(notify);
  if (!observer && typeof document !== 'undefined') {
    observer = new MutationObserver(() => subscribers.forEach((cb) => cb()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
};

const read = (token: string, fallback: string) =>
  typeof document === 'undefined'
    ? fallback
    : getComputedStyle(document.documentElement).getPropertyValue(token).trim() || fallback;

export const useThemeToken = (token: string, fallback: string): string =>
  useSyncExternalStore(
    subscribe,
    () => read(token, fallback),
    () => fallback
  );
