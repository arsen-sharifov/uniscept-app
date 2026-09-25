import { Compass, Keyboard } from 'lucide-react';

import type { IHelpMenuItem, TCanvasExportFormat, TToolTone, TTourAnchor } from '@interfaces';

import { ECanvasTool } from '@/components/tools';

export const EDIT_GROUP_IDS: ReadonlySet<string> = new Set(['build', 'decide', 'link']);

export const HELP_MENU_ITEMS: readonly IHelpMenuItem[] = [
  { id: 'shortcuts', icon: Keyboard, labelKey: 'menuShortcuts', tour: 'helpMenuShortcuts' },
  { id: 'guides', icon: Compass, labelKey: 'menuGuides' },
];

export const TOOL_TONES: Record<TToolTone, { ink: string; fill: string }> = {
  success: { ink: 'var(--status-success)', fill: 'var(--status-success-bg)' },
  error: { ink: 'var(--status-error)', fill: 'var(--status-error-bg)' },
  decision: { ink: 'var(--decision)', fill: 'var(--decision-soft)' },
};

export const TOOL_ANCHORS: Partial<Record<ECanvasTool, TTourAnchor>> = {
  [ECanvasTool.Select]: 'toolbarSelect',
  [ECanvasTool.Pan]: 'toolbarPan',
  [ECanvasTool.ZoomIn]: 'toolbarZoomIn',
  [ECanvasTool.Undo]: 'toolbarUndo',
  [ECanvasTool.AddNode]: 'toolbarAddNode',
  [ECanvasTool.Connect]: 'toolbarConnect',
  [ECanvasTool.Delete]: 'toolbarDelete',
  [ECanvasTool.ValidPath]: 'toolbarValidPath',
  [ECanvasTool.InvalidPath]: 'toolbarInvalidPath',
  [ECanvasTool.Answer]: 'toolbarAnswer',
  [ECanvasTool.CrossReference]: 'toolbarCrossReference',
};

export const TOOLTIP_DELAY_MS = 450;

export const FLASH_DURATION_MS = 220;

export const ICON_STROKE = 1.75;

export const EXPORT_FORMATS: readonly TCanvasExportFormat[] = ['png', 'jpg', 'svg'];

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
  a: ECanvasTool.Answer,
  r: ECanvasTool.CrossReference,
};

export const SHORTCUT_MODIFIER_TOKENS: ReadonlySet<string> = new Set(['⌘', '⇧', '⌥', '⌃']);

export const ARIA_MODIFIER_MAP: Record<string, string> = {
  '⌘': 'Meta+',
  '⌃': 'Control+',
  '⌥': 'Alt+',
  '⇧': 'Shift+',
};
