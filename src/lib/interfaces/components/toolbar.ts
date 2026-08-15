import type { LucideIcon } from 'lucide-react';

import type { TTranslations } from '@interfaces';

export type TToolKind = 'mode' | 'action';

export type TToolTone = 'success' | 'error' | 'decision';

export interface IToolItem {
  id: string;
  icon: LucideIcon;
  label?: string;
  description?: string;
  shortcut?: string;
  kind?: TToolKind;
  tone?: TToolTone;
  disabled?: boolean;
}

export interface IToolGroup {
  id: string;
  label?: string;
  tools: IToolItem[];
}

export interface IToolbarModel {
  groups: IToolGroup[];
  pendingGroupSizes: number[];
  activeTool: string;
  handleToolClick: (id: string) => void;
}

export interface IToolAvailability {
  canUndo: boolean;
  canRedo: boolean;
  canEditCanvas: boolean;
}

export type TCanvasToolsTranslations = TTranslations['platform']['canvas']['tools'];
