import type { Edge, Node } from '@xyflow/react';
import type {
  ICanvasEdgeRow,
  ICanvasNodeRow,
  IComment,
  INodeCommentRow,
  IReferenceNodeData,
  TCanvasNode,
  THandleId,
  TReferenceNode,
} from '@interfaces';
import type { IReferenceTargetMeta } from '@api/client';

const toComment = (row: INodeCommentRow): IComment => ({
  id: row.id,
  text: row.text,
});

export const rowToNode = (
  row: ICanvasNodeRow,
  comments: INodeCommentRow[] = [],
  referenceTarget?: IReferenceTargetMeta
): Node => {
  const position = { x: row.position_x, y: row.position_y };

  if (row.type === 'reference-node') {
    const data: IReferenceNodeData = {
      label: row.label,
      sourceThreadId: row.source_thread_id ?? '',
      sourceThreadName: referenceTarget?.threadName ?? row.label,
      sourceWorkspaceId: referenceTarget?.workspaceId ?? '',
      sourceWorkspaceName: referenceTarget?.workspaceName ?? '',
    };
    const node: TReferenceNode = {
      id: row.id,
      type: 'reference-node',
      position,
      data,
    };
    return node;
  }

  const node: TCanvasNode = {
    id: row.id,
    type: 'canvas-node',
    position,
    data: {
      label: row.label,
      status: row.status,
      comments: comments.map(toComment),
    },
  };
  return node;
};

export const rowToEdge = (row: ICanvasEdgeRow): Edge => ({
  id: row.id,
  source: row.source_node_id,
  target: row.target_node_id,
  sourceHandle: row.source_handle,
  targetHandle: row.target_handle,
  type: 'default',
});

export const isHandleId = (value: unknown): value is THandleId =>
  value === 'top' ||
  value === 'right' ||
  value === 'bottom' ||
  value === 'left';
