import type { TLocale } from './i18n';

export type TTheme = 'daybreak' | 'eclipse' | 'graphite' | 'solstice' | 'aurora' | 'auto';

export type TCanvasPattern = 'dots' | 'lines' | 'cross' | 'none';

export type TDefaultZoom = 50 | 75 | 100 | 125 | 150;

export interface IPreferences {
  theme: TTheme;
  canvasPattern: TCanvasPattern;
  language: TLocale;
  snapToGrid: boolean;
  defaultZoom: TDefaultZoom;
  smartGuides: boolean;
}

export type TEditorPreferences = Pick<IPreferences, 'snapToGrid' | 'defaultZoom' | 'smartGuides'>;

export type TPreferenceUpdater = <Key extends keyof IPreferences>(key: Key, value: IPreferences[Key]) => void;
