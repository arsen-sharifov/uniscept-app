import {
  CheckCircle,
  ExternalLink,
  Hand,
  HelpCircle,
  Link2,
  MessageSquare,
  MousePointer2,
  PlusCircle,
  Redo2,
  Trash2,
  Undo2,
  XCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { TCanvasToolsTranslations, IToolGroup, IToolItem } from '@interfaces';

export enum ECanvasTool {
  Select = 'select',
  Pan = 'pan',
  ZoomIn = 'zoom-in',
  ZoomOut = 'zoom-out',
  AddNode = 'add-node',
  Connect = 'connect',
  Delete = 'delete',
  ValidPath = 'valid-path',
  InvalidPath = 'invalid-path',
  Comment = 'comment',
  CrossReference = 'cross-reference',
  Undo = 'undo',
  Redo = 'redo',
}

export const HELP_TOOL_ID = 'help';

const CANVAS_TOOL_VALUES = new Set<string>(Object.values(ECanvasTool));

export const isCanvasTool = (value: string): value is ECanvasTool => CANVAS_TOOL_VALUES.has(value);

export const buildCanvasTools = (t: TCanvasToolsTranslations): Record<ECanvasTool, IToolItem> => ({
  [ECanvasTool.Select]: {
    id: ECanvasTool.Select,
    icon: MousePointer2,
    label: t.items.select.label,
    description: t.items.select.description,
    shortcut: 'V',
  },
  [ECanvasTool.Pan]: {
    id: ECanvasTool.Pan,
    icon: Hand,
    label: t.items.pan.label,
    description: t.items.pan.description,
    shortcut: 'H',
  },
  [ECanvasTool.ZoomIn]: {
    id: ECanvasTool.ZoomIn,
    icon: ZoomIn,
    label: t.items.zoomIn.label,
    description: t.items.zoomIn.description,
    shortcut: '+',
  },
  [ECanvasTool.ZoomOut]: {
    id: ECanvasTool.ZoomOut,
    icon: ZoomOut,
    label: t.items.zoomOut.label,
    description: t.items.zoomOut.description,
    shortcut: '-',
  },
  [ECanvasTool.AddNode]: {
    id: ECanvasTool.AddNode,
    icon: PlusCircle,
    label: t.items.addNode.label,
    description: t.items.addNode.description,
    shortcut: 'N',
  },
  [ECanvasTool.Connect]: {
    id: ECanvasTool.Connect,
    icon: Link2,
    label: t.items.connect.label,
    description: t.items.connect.description,
    shortcut: 'C',
  },
  [ECanvasTool.Delete]: {
    id: ECanvasTool.Delete,
    icon: Trash2,
    label: t.items.delete.label,
    description: t.items.delete.description,
    shortcut: 'D',
  },
  [ECanvasTool.ValidPath]: {
    id: ECanvasTool.ValidPath,
    icon: CheckCircle,
    label: t.items.validPath.label,
    description: t.items.validPath.description,
    shortcut: 'Y',
  },
  [ECanvasTool.InvalidPath]: {
    id: ECanvasTool.InvalidPath,
    icon: XCircle,
    label: t.items.invalidPath.label,
    description: t.items.invalidPath.description,
    shortcut: 'X',
  },
  [ECanvasTool.Comment]: {
    id: ECanvasTool.Comment,
    icon: MessageSquare,
    label: t.items.comment.label,
    description: t.items.comment.description,
    shortcut: 'M',
  },
  [ECanvasTool.CrossReference]: {
    id: ECanvasTool.CrossReference,
    icon: ExternalLink,
    label: t.items.crossReference.label,
    description: t.items.crossReference.description,
    shortcut: 'R',
  },
  [ECanvasTool.Undo]: {
    id: ECanvasTool.Undo,
    icon: Undo2,
    label: t.items.undo.label,
    description: t.items.undo.description,
    shortcut: '⌘Z',
    kind: 'action',
  },
  [ECanvasTool.Redo]: {
    id: ECanvasTool.Redo,
    icon: Redo2,
    label: t.items.redo.label,
    description: t.items.redo.description,
    shortcut: '⌘⇧Z',
    kind: 'action',
  },
});

export const buildCanvasToolGroups = (t: TCanvasToolsTranslations): IToolGroup[] => {
  const tools = buildCanvasTools(t);

  return [
    {
      id: 'navigate',
      label: t.groups.navigate,
      tools: [tools[ECanvasTool.Select], tools[ECanvasTool.Pan], tools[ECanvasTool.ZoomIn], tools[ECanvasTool.ZoomOut]],
    },
    {
      id: 'history',
      label: t.groups.history,
      tools: [tools[ECanvasTool.Undo], tools[ECanvasTool.Redo]],
    },
    {
      id: 'build',
      label: t.groups.build,
      tools: [tools[ECanvasTool.AddNode], tools[ECanvasTool.Connect], tools[ECanvasTool.Delete]],
    },
    {
      id: 'annotate',
      label: t.groups.annotate,
      tools: [tools[ECanvasTool.ValidPath], tools[ECanvasTool.InvalidPath], tools[ECanvasTool.Comment]],
    },
    {
      id: 'link',
      label: t.groups.link,
      tools: [tools[ECanvasTool.CrossReference]],
    },
  ];
};

export const buildHelpTool = (t: TCanvasToolsTranslations): IToolItem => ({
  id: HELP_TOOL_ID,
  icon: HelpCircle,
  label: t.help,
  shortcut: '?',
});
