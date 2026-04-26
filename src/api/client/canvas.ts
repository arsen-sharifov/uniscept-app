import type { IThreadReference } from '@interfaces';
import { createClient } from '@/lib/supabase/client';
import { getCanvasNodes } from './canvasNode';
import { getCanvasEdges } from './canvasEdge';
import { getNodeComments } from './nodeComment';

export interface IReferenceTargetMeta {
  threadName: string;
  workspaceId: string;
  workspaceName: string;
}

interface IReferenceTargetRow {
  id: string;
  name: string;
  workspace_id: string;
  workspaces: { name: string } | null;
}

const fetchReferenceTargets = async (
  threadIds: string[]
): Promise<Record<string, IReferenceTargetMeta>> => {
  if (threadIds.length === 0) return {};
  const supabase = createClient();
  const { data } = await supabase
    .from('threads')
    .select('id, name, workspace_id, workspaces(name)')
    .in('id', threadIds);

  const map: Record<string, IReferenceTargetMeta> = {};
  for (const row of (data as unknown as IReferenceTargetRow[] | null) ?? []) {
    map[row.id] = {
      threadName: row.name,
      workspaceId: row.workspace_id,
      workspaceName: row.workspaces?.name ?? '',
    };
  }
  return map;
};

export const getCanvasContent = async (threadId: string) => {
  const [nodes, edges] = await Promise.all([
    getCanvasNodes(threadId),
    getCanvasEdges(threadId),
  ]);

  const nodeIds = nodes.map((node) => node.id);
  const referenceTargetIds = nodes
    .filter((node) => node.type === 'reference-node' && node.source_thread_id)
    .map((node) => node.source_thread_id as string);

  const [comments, referenceTargets] = await Promise.all([
    getNodeComments(nodeIds),
    fetchReferenceTargets(referenceTargetIds),
  ]);

  const commentsByNode: Record<string, typeof comments> = {};
  for (const comment of comments) {
    (commentsByNode[comment.node_id] ??= []).push(comment);
  }

  return { nodes, edges, commentsByNode, referenceTargets };
};

interface IThreadReferenceRow {
  id: string;
  name: string;
  workspace_id: string;
  workspaces: { name: string } | null;
}

export const searchReferenceTargets = async (
  workspaceId: string,
  excludeThreadId?: string
): Promise<IThreadReference[]> => {
  const supabase = createClient();

  let query = supabase
    .from('threads')
    .select('id, name, workspace_id, workspaces(name)')
    .eq('workspace_id', workspaceId)
    .order('position');

  if (excludeThreadId) {
    query = query.neq('id', excludeThreadId);
  }

  const { data } = await query;
  if (!data) return [];

  return (data as unknown as IThreadReferenceRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    workspaceId: row.workspace_id,
    workspaceName: row.workspaces?.name ?? '',
  }));
};
