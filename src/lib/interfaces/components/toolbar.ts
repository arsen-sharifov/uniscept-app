import type { LucideIcon } from 'lucide-react';
import type { KeyboardEvent, MouseEvent, RefObject } from 'react';

import type { TCanvasExportFormat, TTranslations } from '@interfaces';

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

export type TMenuOpener = 'pointer' | 'keyboard';

export interface IExportMenuModel {
  open: boolean;
  disabled: boolean;
  loading: boolean;
  hint: string | null;
  menuId: string;
  rootRef: RefObject<HTMLDivElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
  menuRef: RefObject<HTMLDivElement | null>;
  toggle: (event: MouseEvent<HTMLButtonElement>) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  exportFormat: (format: TCanvasExportFormat) => void;
}
