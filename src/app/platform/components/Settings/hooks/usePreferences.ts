'use client';

import { useEffect, useRef, useState } from 'react';

import type { IPreferences, TPreferenceUpdater } from '@interfaces';
import { PREFERENCES_DEBOUNCE_MS } from '@constants';
import { getPreferences, upsertPreferences } from '@api/client';

import { readFromStorage, writeToStorage } from '../utils';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<IPreferences>(readFromStorage);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSyncedRef = useRef<IPreferences>(preferences);

  useEffect(() => {
    let cancelled = false;

    getPreferences().then((dbPrefs) => {
      if (cancelled || !dbPrefs) {
        return;
      }

      lastSyncedRef.current = dbPrefs;
      setPreferences(dbPrefs);
      writeToStorage(dbPrefs);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-canvas-pattern', preferences.canvasPattern);
  }, [preferences.canvasPattern]);

  useEffect(() => {
    document.documentElement.setAttribute('data-snap-to-grid', String(preferences.snapToGrid));
  }, [preferences.snapToGrid]);

  useEffect(() => {
    document.documentElement.setAttribute('data-default-zoom', String(preferences.defaultZoom));
  }, [preferences.defaultZoom]);

  useEffect(() => {
    document.documentElement.setAttribute('data-smart-guides', String(preferences.smartGuides));
  }, [preferences.smartGuides]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const updatePreference: TPreferenceUpdater = (key, value) => {
    setPreferences((prev) => {
      if (prev[key] === value) {
        return prev;
      }

      const next = { ...prev, [key]: value };
      writeToStorage(next);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertPreferences(next)
          .then(() => {
            lastSyncedRef.current = next;
          })
          .catch(() => {
            setPreferences((current) => {
              if (current[key] !== value) {
                return current;
              }

              const reverted = { ...current, [key]: lastSyncedRef.current[key] };
              writeToStorage(reverted);

              return reverted;
            });
          });
      }, PREFERENCES_DEBOUNCE_MS);

      return next;
    });
  };

  return { preferences, updatePreference };
};
