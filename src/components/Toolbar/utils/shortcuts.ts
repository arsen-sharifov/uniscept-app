import {
  ARIA_KEY_NAMES,
  LATIN_LETTER_PATTERN,
  LETTER_KEY_CODE_PATTERN,
  LETTER_PATTERN,
  SHORTCUT_MODIFIER_TOKENS,
} from '../consts';

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

  return renderShortcut(shortcut)
    .map((token) => ARIA_KEY_NAMES[token] ?? token)
    .join('+');
};

export const toShortcutKey = ({ key, code }: Pick<KeyboardEvent, 'key' | 'code'>): string => {
  if (!LETTER_PATTERN.test(key) || LATIN_LETTER_PATTERN.test(key)) return key.toLowerCase();

  return (LETTER_KEY_CODE_PATTERN.exec(code)?.[1] ?? key).toLowerCase();
};
