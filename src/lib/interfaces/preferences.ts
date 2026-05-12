import type { TLocale } from './i18n';

export type TTheme = 'daybreak' | 'eclipse' | 'graphite' | 'solstice' | 'aurora' | 'auto';

export type TCanvasPattern = 'dots' | 'lines' | 'cross' | 'none';

export interface IPreferences {
  theme: TTheme;
  canvasPattern: TCanvasPattern;
  language: TLocale;
}

export type TPreferenceUpdater = <Key extends keyof IPreferences>(key: Key, value: IPreferences[Key]) => void;
