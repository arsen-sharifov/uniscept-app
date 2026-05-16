'use client';

import type { IPreferences } from '@interfaces';
import { CANVAS_PATTERN_VALUES, DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY, THEME_VALUES } from '@constants';
import { LOCALES } from '@/i18n';

const isOneOf = <T extends string>(values: readonly T[], candidate: unknown): candidate is T =>
  typeof candidate === 'string' && values.some((value) => value === candidate);

export const readFromStorage = (): IPreferences => {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_PREFERENCES;
    }

    const candidate = parsed as Partial<IPreferences>;

    return {
      theme: isOneOf(THEME_VALUES, candidate.theme) ? candidate.theme : DEFAULT_PREFERENCES.theme,
      canvasPattern: isOneOf(CANVAS_PATTERN_VALUES, candidate.canvasPattern)
        ? candidate.canvasPattern
        : DEFAULT_PREFERENCES.canvasPattern,
      language: isOneOf(LOCALES, candidate.language) ? candidate.language : DEFAULT_PREFERENCES.language,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const writeToStorage = (prefs: IPreferences): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
};
