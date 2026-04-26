import type { LucideIcon } from 'lucide-react';

export type TToolKind = 'mode' | 'action';

export interface IToolItem {
  id: string;
  icon: LucideIcon;
  label?: string;
  description?: string;
  shortcut?: string;
  kind?: TToolKind;
  disabled?: boolean;
}

export interface IToolGroup {
  id: string;
  label?: string;
  tools: IToolItem[];
}

export interface IToolAvailability {
  canUndo: boolean;
  canRedo: boolean;
}

interface IToolCopy {
  label: string;
  description: string;
}

export interface ICanvasToolsTranslations {
  ariaLabel: string;
  help: string;
  groups: {
    navigate: string;
    history: string;
    build: string;
    annotate: string;
    link: string;
  };
  items: {
    select: IToolCopy;
    pan: IToolCopy;
    zoomIn: IToolCopy;
    zoomOut: IToolCopy;
    addNode: IToolCopy;
    connect: IToolCopy;
    delete: IToolCopy;
    validPath: IToolCopy;
    invalidPath: IToolCopy;
    comment: IToolCopy;
    crossReference: IToolCopy;
    undo: IToolCopy;
    redo: IToolCopy;
  };
}
