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
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-canvas-pattern', preferences.canvasPattern);
  }, [preferences.canvasPattern]);

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
            const rollback = lastSyncedRef.current;
            setPreferences((current) => {
              if (current[key] !== value) {
                return current;
              }

              writeToStorage(rollback);

              return rollback;
            });
          });
      }, PREFERENCES_DEBOUNCE_MS);

      return next;
    });
  };

  return { preferences, updatePreference };
};
