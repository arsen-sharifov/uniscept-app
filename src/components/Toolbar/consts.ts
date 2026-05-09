import { ECanvasTool } from '@/components/tools';

export const TOOLTIP_DELAY_MS = 450;

export const FLASH_DURATION_MS = 220;

export const TOOL_KEY_MAP: Record<string, ECanvasTool> = {
  v: ECanvasTool.Select,
  h: ECanvasTool.Pan,
  '=': ECanvasTool.ZoomIn,
  '+': ECanvasTool.ZoomIn,
  '-': ECanvasTool.ZoomOut,
  n: ECanvasTool.AddNode,
  c: ECanvasTool.Connect,
  d: ECanvasTool.Delete,
  y: ECanvasTool.ValidPath,
  x: ECanvasTool.InvalidPath,
  m: ECanvasTool.Comment,
  r: ECanvasTool.CrossReference,
};

export const SHORTCUT_MODIFIER_TOKENS: ReadonlySet<string> = new Set(['⌘', '⇧', '⌥', '⌃']);

export const ARIA_MODIFIER_MAP: Record<string, string> = {
  '⌘': 'Meta+',
  '⌃': 'Control+',
  '⌥': 'Alt+',
  '⇧': 'Shift+',
};
