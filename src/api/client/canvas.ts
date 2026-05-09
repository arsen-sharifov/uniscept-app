import {
  ECanvasNodeType,
  type ICanvasNodeWithThreadRow,
  type ICanvasSnapshot,
  type INodeCommentRow,
  type INodeReference,
  type IReferenceTargetMeta,
} from '@interfaces';
import { createClient } from '@/lib/supabase';
import { getCanvasNodes } from './canvasNode';
import { getCanvasEdges } from './canvasEdge';
import { getNodeComments } from './nodeComment';
import { getCanvasComments } from './canvasComment';
import { REFERENCE_SEARCH_LIMIT, REFERENCE_TARGET_SELECT } from './consts';
import { toNodeReference, toReferenceTargetMeta } from './utils';

const getReferenceTargetsByIds = async (nodeIds: string[]): Promise<Record<string, IReferenceTargetMeta>> => {
  if (nodeIds.length === 0) return {};

  const supabase = createClient();

  const { data, error } = await supabase
    .from('canvas_nodes')
    .select(REFERENCE_TARGET_SELECT)
    .in('id', nodeIds)
    .returns<ICanvasNodeWithThreadRow[]>();

  if (error) throw error;

  return Object.fromEntries((data ?? []).map((row) => [row.id, toReferenceTargetMeta(row)]));
};

const groupCommentsByNode = (comments: INodeCommentRow[]): Record<string, INodeCommentRow[]> =>
  comments.reduce<Record<string, INodeCommentRow[]>>((acc, comment) => {
    (acc[comment.node_id] ??= []).push(comment);
    return acc;
  }, {});

export const getCanvasContent = async (threadId: string): Promise<ICanvasSnapshot> => {
  const canvasCommentsPromise = getCanvasComments(threadId);

  const [nodes, edges] = await Promise.all([getCanvasNodes(threadId), getCanvasEdges(threadId)]);

  const nodeIds = nodes.map((node) => node.id);
  const referenceTargetIds = nodes.flatMap((node) =>
    node.type === ECanvasNodeType.Reference && node.source_node_id ? [node.source_node_id] : []
  );

  const [comments, referenceTargets, canvasComments] = await Promise.all([
    getNodeComments(nodeIds),
    getReferenceTargetsByIds(referenceTargetIds),
    canvasCommentsPromise,
  ]);

  return {
    nodes,
    edges,
    commentsByNode: groupCommentsByNode(comments),
    canvasComments,
    referenceTargets,
  };
};

export const searchReferenceTargets = async (
  workspaceId: string,
  excludeThreadId?: string
): Promise<INodeReference[]> => {
  const supabase = createClient();

  let query = supabase
    .from('canvas_nodes')
    .select(REFERENCE_TARGET_SELECT)
    .eq('type', ECanvasNodeType.Canvas)
    .eq('threads.workspace_id', workspaceId)
    .order('created_at')
    .limit(REFERENCE_SEARCH_LIMIT);

  if (excludeThreadId) {
    query = query.neq('thread_id', excludeThreadId);
  }

  const { data, error } = await query.returns<ICanvasNodeWithThreadRow[]>();

  if (error) throw error;

  return (data ?? []).map(toNodeReference);
};
