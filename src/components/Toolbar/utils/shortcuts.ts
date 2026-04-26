import { ARIA_MODIFIER_MAP, SHORTCUT_MODIFIER_TOKENS } from '../consts';

const ARIA_MODIFIER_PATTERN = new RegExp(Object.keys(ARIA_MODIFIER_MAP).join('|'), 'g');

export const renderShortcut = (shortcut: string): string[] =>
  Array.from(shortcut).reduce<string[]>((tokens, char) => {
    if (SHORTCUT_MODIFIER_TOKENS.has(char)) return [...tokens, char];

    const last = tokens.at(-1);
    if (last !== undefined && !SHORTCUT_MODIFIER_TOKENS.has(last)) {
      return [...tokens.slice(0, -1), last + char];
    }

    return [...tokens, char];
  }, []);

export const toAriaShortcut = (shortcut: string | undefined): string | undefined => {
  if (!shortcut) return undefined;

  return shortcut.replace(ARIA_MODIFIER_PATTERN, (token) => ARIA_MODIFIER_MAP[token] ?? token).replace(/\+\s*$/, '');
};
