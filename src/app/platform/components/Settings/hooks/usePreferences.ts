'use client';

import { useEffect, useRef, useState } from 'react';
import type { IPreferences } from '@interfaces';
import { getPreferences, upsertPreferences } from '@api/client';
import { STORAGE_KEY } from '../consts';
import { readFromStorage } from '../utils';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<IPreferences>(readFromStorage);
  const initialized = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getPreferences()
      .then((dbPrefs) => {
        if (!dbPrefs) return;
        setPreferences(dbPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dbPrefs));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const updatePreference = <Key extends keyof IPreferences>(
    key: Key,
    value: IPreferences[Key]
  ) => {
    setPreferences((prev) => {
      if (prev[key] === value) return prev;
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        upsertPreferences(next).catch(() => {});
      }, 500);
      return next;
    });
  };

  return { preferences, updatePreference };
};
