import type { BubbleMenuProps } from '@tiptap/react/menus';

export const FOCUS_OPTIONS = { scrollIntoView: false } as const;

export const KEYMAP_PRIORITY = 1000;

export const TOOLBAR_UPDATE_DELAY_MS = 120;

export const TOOLBAR_POSITION: BubbleMenuProps['options'] = {
  strategy: 'fixed',
  placement: 'top',
  offset: 8,
  flip: { padding: 8 },
  shift: { padding: 8 },
};

export const DEFAULT_SWATCH_COLOR = 'var(--text-strong)';
