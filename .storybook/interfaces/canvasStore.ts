import type { Edge, Node } from '@xyflow/react';

import type { IComment } from '@interfaces';

import type { ECanvasTool } from '@/components';

export interface IMockCanvasState {
  threadId?: string | null;
  userId?: string | null;
  hydrated?: boolean;
  nodes?: Node[];
  edges?: Edge[];
  canvasComments?: IComment[];
  activeTool?: ECanvasTool;
  pendingConnection?: string | null;
  referenceSearchPosition?: { x: number; y: number } | null;
  editingNodeId?: string | null;
  openCommentsNodeId?: string | null;
  canvasCommentsOpen?: boolean;
  middlePan?: boolean;
}
