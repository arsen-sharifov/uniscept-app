import { Hand, Undo2, ZoomIn } from 'lucide-react';

import type { IToolAvailability, IToolGroup, IToolItem } from '@interfaces';

export const FULL_AVAILABILITY: IToolAvailability = { canUndo: true, canRedo: true, canEditCanvas: true };
export const NO_HISTORY_AVAILABILITY: IToolAvailability = { canUndo: false, canRedo: false, canEditCanvas: true };
export const READONLY_AVAILABILITY: IToolAvailability = { canUndo: true, canRedo: true, canEditCanvas: false };
export const NO_AVAILABILITY: IToolAvailability = { canUndo: false, canRedo: false, canEditCanvas: false };

export const PAN_TOOL: IToolItem = { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' };
export const UNDO_TOOL: IToolItem = { id: 'undo', icon: Undo2, label: 'Undo', kind: 'action' };
export const ZOOM_IN_TOOL: IToolItem = { id: 'zoom-in', icon: ZoomIn, label: 'Zoom in', shortcut: '+' };

export const SHORTCUT_GROUPS: IToolGroup[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    tools: [PAN_TOOL, { ...UNDO_TOOL, shortcut: '⌘⇧Z' }],
  },
];

export const TOOL_GROUPS = [
  { id: 'navigate', label: 'Navigate', tools: [PAN_TOOL, ZOOM_IN_TOOL] },
  { id: 'history', label: 'History', tools: [UNDO_TOOL] },
];

export const TEXT_SHORTCUT_GROUP: IToolGroup = {
  id: 'text',
  label: 'Text',
  tools: [{ id: 'bold', icon: Hand, label: 'Bold', shortcut: '⌘B' }],
};
