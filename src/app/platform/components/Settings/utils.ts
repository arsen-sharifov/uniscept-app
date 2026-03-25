import type { IPreferences } from '@interfaces';
import { DEFAULT_PREFERENCES, STORAGE_KEY } from './consts';

export const readFromStorage = (): IPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};
