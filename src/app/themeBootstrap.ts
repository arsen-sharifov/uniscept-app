import { CANVAS_PATTERN_VALUES, DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY, THEME_VALUES } from '@constants';

const BOOTSTRAP_CONFIG = {
  storageKey: PREFERENCES_STORAGE_KEY,
  themes: THEME_VALUES,
  patterns: CANVAS_PATTERN_VALUES,
  defaultTheme: DEFAULT_PREFERENCES.theme,
  defaultPattern: DEFAULT_PREFERENCES.canvasPattern,
};

const escapeForInlineScript = (json: string) =>
  json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export const THEME_BOOTSTRAP = `
(() => {
  const c = ${escapeForInlineScript(JSON.stringify(BOOTSTRAP_CONFIG))};
  const h = document.documentElement;
  const set = (a, v) => h.setAttribute(a, v);
  try {
    const p = JSON.parse(localStorage.getItem(c.storageKey) || 'null');
    const t = p && p.theme;
    const x = p && p.canvasPattern;
    set('data-theme', c.themes.includes(t) ? t : c.defaultTheme);
    set('data-canvas-pattern', c.patterns.includes(x) ? x : c.defaultPattern);
  } catch {
    set('data-theme', c.defaultTheme);
    set('data-canvas-pattern', c.defaultPattern);
  }
})();
`;
