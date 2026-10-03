'use client';

import { useSyncExternalStore } from 'react';

import { createRootAttributeSubscription } from '@/lib/utils';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const subscribeToTheme = createRootAttributeSubscription(['data-theme']);

const subscribe = (notify: () => void) => {
  const unsubscribeFromTheme = subscribeToTheme(notify);
  const colorScheme = window.matchMedia(COLOR_SCHEME_QUERY);
  colorScheme.addEventListener('change', notify);

  return () => {
    unsubscribeFromTheme();
    colorScheme.removeEventListener('change', notify);
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
    () => fallback,
  );
