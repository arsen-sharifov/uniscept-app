import type { IPreferences, TCanvasPattern, TTheme } from '@interfaces';
import { DEFAULT_LOCALE } from '@/i18n';

export const THEME_VALUES: readonly TTheme[] = ['daybreak', 'eclipse', 'graphite', 'solstice', 'aurora', 'auto'];

export const CANVAS_PATTERN_VALUES: readonly TCanvasPattern[] = ['dots', 'lines', 'cross', 'none'];

export const PREFERENCES_STORAGE_KEY = 'uniscept-preferences';
export const PREFERENCES_DEBOUNCE_MS = 500;

export const DEFAULT_PREFERENCES: Required<IPreferences> = {
  theme: 'auto',
  canvasPattern: 'dots',
  language: DEFAULT_LOCALE,
};
