import {
  CheckCircle,
  ExternalLink,
  Hand,
  Link2,
  MousePointer2,
  PlusCircle,
  Redo2,
  Trash2,
  Undo2,
  XCircle,
} from 'lucide-react';
import type { IToolItem } from '@interfaces';

export enum ECanvasTool {
  Select = 'select',
  Pan = 'pan',
  AddNode = 'add-node',
  Connect = 'connect',
  Delete = 'delete',
  ValidPath = 'valid-path',
  InvalidPath = 'invalid-path',
  CrossReference = 'cross-reference',
  Undo = 'undo',
  Redo = 'redo',
}

export const CANVAS_TOOLS: Record<ECanvasTool, IToolItem> = {
  [ECanvasTool.Select]: {
    id: ECanvasTool.Select,
    icon: MousePointer2,
    label: 'Select',
  },
  [ECanvasTool.Pan]: { id: ECanvasTool.Pan, icon: Hand, label: 'Pan' },
  [ECanvasTool.AddNode]: {
    id: ECanvasTool.AddNode,
    icon: PlusCircle,
    label: 'Add Node',
  },
  [ECanvasTool.Connect]: {
    id: ECanvasTool.Connect,
    icon: Link2,
    label: 'Connect',
  },
  [ECanvasTool.Delete]: {
    id: ECanvasTool.Delete,
    icon: Trash2,
    label: 'Delete',
  },
  [ECanvasTool.ValidPath]: {
    id: ECanvasTool.ValidPath,
    icon: CheckCircle,
    label: 'Valid Path',
  },
  [ECanvasTool.InvalidPath]: {
    id: ECanvasTool.InvalidPath,
    icon: XCircle,
    label: 'Invalid Path',
  },
  [ECanvasTool.CrossReference]: {
    id: ECanvasTool.CrossReference,
    icon: ExternalLink,
    label: 'Cross-Canvas Reference',
  },
  [ECanvasTool.Undo]: { id: ECanvasTool.Undo, icon: Undo2, label: 'Undo' },
  [ECanvasTool.Redo]: { id: ECanvasTool.Redo, icon: Redo2, label: 'Redo' },
};

export const CANVAS_TOOL_GROUPS: IToolItem[][] = [
  [CANVAS_TOOLS[ECanvasTool.Select], CANVAS_TOOLS[ECanvasTool.Pan]],
  [CANVAS_TOOLS[ECanvasTool.Undo], CANVAS_TOOLS[ECanvasTool.Redo]],
  [
    CANVAS_TOOLS[ECanvasTool.AddNode],
    CANVAS_TOOLS[ECanvasTool.Connect],
    CANVAS_TOOLS[ECanvasTool.Delete],
  ],
  [CANVAS_TOOLS[ECanvasTool.ValidPath], CANVAS_TOOLS[ECanvasTool.InvalidPath]],
  [CANVAS_TOOLS[ECanvasTool.CrossReference]],
];
