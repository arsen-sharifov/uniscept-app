import {
  CheckCircle,
  Circle,
  Copy,
  Eye,
  EyeOff,
  Hand,
  Layers,
  Link2,
  Lock,
  MousePointer2,
  Pencil,
  PlusCircle,
  Redo2,
  Scissors,
  Square,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Unlock,
  XCircle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ToolItem } from '@/components/Toolbar';

export const defaultGroups: ToolItem[][] = [
  [{ icon: MousePointer2 }, { icon: Hand }],
  [
    { icon: PlusCircle },
    { icon: Pencil },
    { icon: Square },
    { icon: Circle },
    { icon: Type },
  ],
  [{ icon: Link2 }, { icon: StickyNote }],
  [
    { icon: ZoomIn },
    { icon: CheckCircle },
    { icon: XCircle },
    { icon: Trash2 },
  ],
];

export const minimalGroups: ToolItem[][] = [
  [{ icon: MousePointer2 }],
  [{ icon: PlusCircle }, { icon: Pencil }],
  [{ icon: Trash2 }],
];

export const extendedGroups: ToolItem[][] = [
  [{ icon: MousePointer2 }, { icon: Hand }],
  [
    { icon: PlusCircle },
    { icon: Pencil },
    { icon: Square },
    { icon: Circle },
    { icon: Type },
  ],
  [{ icon: Link2 }, { icon: StickyNote }, { icon: Layers }],
  [{ icon: ZoomIn }, { icon: ZoomOut }],
  [{ icon: Undo2 }, { icon: Redo2 }],
  [{ icon: Copy }, { icon: Scissors }],
  [{ icon: Lock }, { icon: Unlock }, { icon: Eye }, { icon: EyeOff }],
  [{ icon: CheckCircle }, { icon: XCircle }, { icon: Trash2 }],
];
