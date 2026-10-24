import type { Edge } from '@xyflow/react';

import {
  ECanvasNodeType,
  type ICanvasEdgeRow,
  type ICanvasNodeData,
  type ICanvasNodeRow,
  type IComment,
  type INodeCommentRow,
  type IReferenceNodeData,
  type IReferenceTargetMeta,
  type IWorkspaceMember,
  type TCanvasAuthors,
  type TCanvasNode,
  type TReferenceNode,
} from '@interfaces';

import { parseRichText } from '@/lib/richText';

import { toComment } from './mappers';

const toAuthorship = (
  row: ICanvasNodeRow,
): Pick<ICanvasNodeData, 'createdBy' | 'createdAt' | 'editedAt' | 'editedBy'> => ({
  createdBy: row.created_by ?? undefined,
  createdAt: row.created_at,
  editedAt: row.edited_at ?? undefined,
  editedBy: row.edited_by ?? undefined,
});

export const rowToNode = (
  row: ICanvasNodeRow,
  comments: INodeCommentRow[] = [],
  referenceTarget?: IReferenceTargetMeta,
): TCanvasNode | TReferenceNode => {
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
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
    };

    return {
      id: row.id,
      type: ECanvasNodeType.Reference,
      position,
      data,
    } satisfies TReferenceNode;
  }

  const mappedComments: IComment[] = comments.map(toComment);

  if (row.type === ECanvasNodeType.Question) {
    return {
      id: row.id,
      type: ECanvasNodeType.Question,
      position,
      deletable: false,
      data: {
        label: row.label,
        richLabel: parseRichText(row.rich_label) ?? undefined,
        status: null,
        isAnswer: false,
        comments: mappedComments,
        ...toAuthorship(row),
      },
    } satisfies TCanvasNode;
  }

  return {
    id: row.id,
    type: ECanvasNodeType.Canvas,
    position,
    data: {
      label: row.label,
      richLabel: parseRichText(row.rich_label) ?? undefined,
      status: row.status ?? null,
      isAnswer: row.is_answer,
      comments: mappedComments,
      ...toAuthorship(row),
    },
  } satisfies TCanvasNode;
};

export const toCanvasAuthors = (members: IWorkspaceMember[]): TCanvasAuthors =>
  Object.fromEntries(
    members.map((member) => [member.userId, { name: member.name || member.email, avatarIcon: member.avatarIcon }]),
  );

export const rowToEdge = (row: ICanvasEdgeRow): Edge => ({
  id: row.id,
  source: row.source_node_id,
  target: row.target_node_id,
  sourceHandle: row.source_handle,
  targetHandle: row.target_handle,
  type: 'default',
});
