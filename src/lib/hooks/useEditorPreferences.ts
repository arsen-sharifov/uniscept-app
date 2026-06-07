'use client';

import { useSyncExternalStore } from 'react';

import type { TDefaultZoom, TEditorPreferences } from '@interfaces';
import { DEFAULT_PREFERENCES } from '@constants';
import { isDefaultZoom } from '@/lib/utils';

const SUBSCRIBED_ATTRS = ['data-snap-to-grid', 'data-default-zoom', 'data-smart-guides'];

const SERVER_SNAPSHOT: TEditorPreferences = {
  snapToGrid: DEFAULT_PREFERENCES.snapToGrid,
  defaultZoom: DEFAULT_PREFERENCES.defaultZoom,
  smartGuides: DEFAULT_PREFERENCES.smartGuides,
};

const subscribers = new Set<() => void>();
let observer: MutationObserver | null = null;
let cached: TEditorPreferences = SERVER_SNAPSHOT;

const readBoolean = (attr: string, fallback: boolean): boolean => {
  const value = document.documentElement.getAttribute(attr);

  return value === null ? fallback : value === 'true';
};

const readDefaultZoom = (fallback: TDefaultZoom): TDefaultZoom => {
  const parsed = Number(document.documentElement.getAttribute('data-default-zoom'));

  return isDefaultZoom(parsed) ? parsed : fallback;
};

const readSnapshot = (): TEditorPreferences => {
  if (typeof document === 'undefined') {
    return SERVER_SNAPSHOT;
  }

  const next: TEditorPreferences = {
    snapToGrid: readBoolean('data-snap-to-grid', DEFAULT_PREFERENCES.snapToGrid),
    defaultZoom: readDefaultZoom(DEFAULT_PREFERENCES.defaultZoom),
    smartGuides: readBoolean('data-smart-guides', DEFAULT_PREFERENCES.smartGuides),
  };

  if (
    cached.snapToGrid === next.snapToGrid &&
    cached.defaultZoom === next.defaultZoom &&
    cached.smartGuides === next.smartGuides
  ) {
    return cached;
  }

  cached = next;

  return cached;
};

const subscribe = (notify: () => void) => {
  subscribers.add(notify);

  if (!observer && typeof document !== 'undefined') {
    observer = new MutationObserver(() => subscribers.forEach((cb) => cb()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: SUBSCRIBED_ATTRS });
  }

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
};

export const useEditorPreferences = (): TEditorPreferences =>
  useSyncExternalStore(subscribe, readSnapshot, () => SERVER_SNAPSHOT);
