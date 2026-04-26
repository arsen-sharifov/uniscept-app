import type {
  ICanvasNodeRow,
  ICanvasEdgeRow,
  INodeCommentRow,
  TNodeStatus,
  THandleId,
  IReferenceNodeData,
} from '@interfaces';

/**
 * Discrete intent emitted by the canvas store after a successful local mutation.
 * The sync layer subscribes to these and persists them to Supabase.
 */
export type TCanvasOp =
  | {
      type: 'createCanvasNode';
      id: string;
      threadId: string;
      x: number;
      y: number;
      label: string;
    }
  | {
      type: 'createReferenceNode';
      id: string;
      threadId: string;
      x: number;
      y: number;
      data: IReferenceNodeData;
    }
  | { type: 'deleteNode'; id: string }
  | { type: 'updateNodePosition'; id: string; x: number; y: number }
  | { type: 'updateNodeLabel'; id: string; label: string }
  | { type: 'updateNodeStatus'; id: string; status: TNodeStatus }
  | {
      type: 'createEdge';
      id: string;
      threadId: string;
      source: string;
      target: string;
      sourceHandle: THandleId;
      targetHandle: THandleId;
    }
  | { type: 'deleteEdge'; id: string }
  | { type: 'createComment'; id: string; nodeId: string; text: string };

import type { IReferenceTargetMeta } from '@api/client';

export type TCanvasSnapshot = {
  nodes: ICanvasNodeRow[];
  edges: ICanvasEdgeRow[];
  commentsByNode: Record<string, INodeCommentRow[]>;
  referenceTargets: Record<string, IReferenceTargetMeta>;
};

type TListener = (op: TCanvasOp) => void;

const listeners = new Set<TListener>();

export const emitCanvasOp = (op: TCanvasOp) => {
  for (const listener of listeners) listener(op);
};

export const subscribeCanvasOps = (listener: TListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
