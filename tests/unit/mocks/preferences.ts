import type { IPreferences, TEditorPreferences } from '@interfaces';

import { DEFAULT_LOCALE } from '@mocks/i18n';

export const PREFERENCES = {
  theme: 'eclipse',
  canvasPattern: 'lines',
  language: 'uk',
  snapToGrid: true,
  defaultZoom: 125,
  smartGuides: false,
} as const;

export const PREFERENCE_COLUMNS = {
  theme: 'eclipse',
  canvas_pattern: 'lines',
  language: 'uk',
  snap_to_grid: true,
  default_zoom: 125,
  smart_guides: false,
} as const;

export const PREFERENCE_ATTRIBUTES = [
  'data-theme',
  'data-canvas-pattern',
  'data-snap-to-grid',
  'data-default-zoom',
  'data-smart-guides',
];

export const HYDRATED_PREFERENCES: IPreferences = { ...PREFERENCES, language: DEFAULT_LOCALE };

export const DEFAULT_EDITOR_PREFERENCES: TEditorPreferences = {
  snapToGrid: false,
  defaultZoom: 100,
  smartGuides: true,
};

export const DEFAULT_THEME_ATTRIBUTES = {
  'data-scripted': '',
  'data-theme': 'auto',
  'data-canvas-pattern': 'dots',
  'data-default-zoom': '100',
  'data-snap-to-grid': 'false',
  'data-smart-guides': 'true',
};
