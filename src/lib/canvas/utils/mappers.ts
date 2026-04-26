import type { Edge, Node } from '@xyflow/react';
import {
  ECanvasNodeType,
  type ICanvasEdgeRow,
  type ICanvasNodeRow,
  type INodeCommentRow,
  type IReferenceNodeData,
  type IReferenceTargetMeta,
  type TCanvasNode,
  type TReferenceNode,
} from '@interfaces';
import { toComment } from '@api/client';

export const rowToNode = (
  row: ICanvasNodeRow,
  comments: INodeCommentRow[] = [],
  referenceTarget?: IReferenceTargetMeta
): Node => {
  const position = { x: row.position_x, y: row.position_y };

  if (row.type === ECanvasNodeType.Reference) {
    const data: IReferenceNodeData = {
      label: row.label,
      sourceNodeId: row.source_node_id ?? '',
      sourceNodeLabel: referenceTarget?.nodeLabel ?? row.label,
      sourceThreadId: referenceTarget?.threadId ?? '',
      sourceThreadName: referenceTarget?.threadName ?? '',
      sourceWorkspaceId: referenceTarget?.workspaceId ?? '',
      sourceWorkspaceName: referenceTarget?.workspaceName ?? '',
    };

    return {
      id: row.id,
      type: ECanvasNodeType.Reference,
      position,
      data,
    } satisfies TReferenceNode;
  }

  return {
    id: row.id,
    type: ECanvasNodeType.Canvas,
    position,
    data: {
      label: row.label,
      status: row.status ?? null,
      comments: comments.map(toComment),
    },
  } satisfies TCanvasNode;
};

export const rowToEdge = (row: ICanvasEdgeRow): Edge => ({
  id: row.id,
  source: row.source_node_id,
  target: row.target_node_id,
  sourceHandle: row.source_handle,
  targetHandle: row.target_handle,
  type: 'default',
});
