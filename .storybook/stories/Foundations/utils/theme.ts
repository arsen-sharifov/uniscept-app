import type { TTheme } from '@constants';
import type { IThemeMeta } from '@story-interfaces';

import { THEME_LIST } from '../consts';

export const findThemeAncestor = (node: HTMLElement | null): HTMLElement | null => {
  let current: HTMLElement | null = node;
  while (current && !current.hasAttribute('data-theme')) {
    current = current.parentElement;
  }

  return current;
};

export const findActiveTheme = (themeId: TTheme): IThemeMeta =>
  THEME_LIST.find((t) => t.id === themeId) ?? THEME_LIST[0];

export const orderedSpecimens = (active: TTheme): { hero: IThemeMeta; rest: IThemeMeta[] } => ({
  hero: findActiveTheme(active),
  rest: THEME_LIST.filter((t) => t.id !== active),
});
