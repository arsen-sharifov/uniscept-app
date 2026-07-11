import type { Edge, Node } from '@xyflow/react';

import type { ECanvasTool } from '@/components';

export interface IMockCanvasState {
  threadId?: string | null;
  hydrated?: boolean;
  nodes?: Node[];
  edges?: Edge[];
  activeTool?: ECanvasTool;
  pendingConnection?: string | null;
  referenceSearchPosition?: { x: number; y: number } | null;
  editingNodeId?: string | null;
  openCommentsNodeId?: string | null;
  middlePan?: boolean;
}
