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
import type { IToolGroup, IToolItem } from '@interfaces';

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
    description: 'Select and drag nodes around the canvas.',
    shortcut: 'V',
  },
  [ECanvasTool.Pan]: {
    id: ECanvasTool.Pan,
    icon: Hand,
    label: 'Pan',
    description: 'Hold and drag to pan the viewport.',
    shortcut: 'H',
  },
  [ECanvasTool.AddNode]: {
    id: ECanvasTool.AddNode,
    icon: PlusCircle,
    label: 'Add node',
    description: 'Click anywhere on the canvas to drop a new node.',
    shortcut: 'N',
  },
  [ECanvasTool.Connect]: {
    id: ECanvasTool.Connect,
    icon: Link2,
    label: 'Connect',
    description: 'Click two nodes to wire them together.',
    shortcut: 'C',
  },
  [ECanvasTool.Delete]: {
    id: ECanvasTool.Delete,
    icon: Trash2,
    label: 'Delete',
    description: 'Click a node or edge to remove it.',
    shortcut: 'D',
  },
  [ECanvasTool.ValidPath]: {
    id: ECanvasTool.ValidPath,
    icon: CheckCircle,
    label: 'Mark valid',
    description: 'Tag clicked nodes as a valid path.',
    shortcut: 'Y',
  },
  [ECanvasTool.InvalidPath]: {
    id: ECanvasTool.InvalidPath,
    icon: XCircle,
    label: 'Mark invalid',
    description: 'Tag clicked nodes as an invalid path.',
    shortcut: 'X',
  },
  [ECanvasTool.CrossReference]: {
    id: ECanvasTool.CrossReference,
    icon: ExternalLink,
    label: 'Cross-reference',
    description: 'Drop a reference to a node from another canvas.',
    shortcut: 'R',
  },
  [ECanvasTool.Undo]: {
    id: ECanvasTool.Undo,
    icon: Undo2,
    label: 'Undo',
    description: 'Step back through your changes.',
    shortcut: '⌘Z',
    kind: 'action',
  },
  [ECanvasTool.Redo]: {
    id: ECanvasTool.Redo,
    icon: Redo2,
    label: 'Redo',
    description: 'Replay the change you just undid.',
    shortcut: '⌘⇧Z',
    kind: 'action',
  },
};

export const CANVAS_TOOL_GROUPS: IToolGroup[] = [
  {
    id: 'navigate',
    label: 'Navigate',
    tools: [CANVAS_TOOLS[ECanvasTool.Select], CANVAS_TOOLS[ECanvasTool.Pan]],
  },
  {
    id: 'history',
    label: 'History',
    tools: [CANVAS_TOOLS[ECanvasTool.Undo], CANVAS_TOOLS[ECanvasTool.Redo]],
  },
  {
    id: 'build',
    label: 'Build',
    tools: [
      CANVAS_TOOLS[ECanvasTool.AddNode],
      CANVAS_TOOLS[ECanvasTool.Connect],
      CANVAS_TOOLS[ECanvasTool.Delete],
    ],
  },
  {
    id: 'annotate',
    label: 'Annotate',
    tools: [
      CANVAS_TOOLS[ECanvasTool.ValidPath],
      CANVAS_TOOLS[ECanvasTool.InvalidPath],
    ],
  },
  {
    id: 'link',
    label: 'Link',
    tools: [CANVAS_TOOLS[ECanvasTool.CrossReference]],
  },
];
