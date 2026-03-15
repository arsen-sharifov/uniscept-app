import { createClient } from './client';
import type { Tables, TablesInsert, TablesUpdate } from './database.types';

export type TDbCanvasNode = Tables<'canvas_nodes'>;
export type TDbComment = Tables<'comments'>;
export type TDbCanvasNodeWithComments = TDbCanvasNode & {
  comments: TDbComment[];
};

export const fetchWorkspaces = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at');
  if (error) throw error;
  return data;
};

export const insertWorkspace = async (name: string, ownerId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: ownerId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const fetchTopics = async (workspaceId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('sort_order');
  if (error) throw error;
  return data;
};

export const insertTopic = async (topic: TablesInsert<'topics'>) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('topics')
    .insert(topic)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeTopic = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
};

export const fetchCanvasData = async (topicId: string) => {
  const supabase = createClient();
  const [nodesRes, edgesRes] = await Promise.all([
    supabase
      .from('canvas_nodes')
      .select('*, comments(*)')
      .eq('topic_id', topicId),
    supabase.from('canvas_edges').select('*').eq('topic_id', topicId),
  ]);
  if (nodesRes.error) throw nodesRes.error;
  if (edgesRes.error) throw edgesRes.error;
  return {
    nodes: nodesRes.data as TDbCanvasNodeWithComments[],
    edges: edgesRes.data,
  };
};

export const insertCanvasNode = async (node: TablesInsert<'canvas_nodes'>) => {
  const supabase = createClient();
  const { error } = await supabase.from('canvas_nodes').insert(node);
  if (error) throw error;
};

export const updateCanvasNode = async (
  id: string,
  updates: TablesUpdate<'canvas_nodes'>
) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('canvas_nodes')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
};

export const removeCanvasNode = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('canvas_nodes').delete().eq('id', id);
  if (error) throw error;
};

export const insertCanvasEdge = async (edge: TablesInsert<'canvas_edges'>) => {
  const supabase = createClient();
  const { error } = await supabase.from('canvas_edges').insert(edge);
  if (error) throw error;
};

export const removeCanvasEdge = async (id: string) => {
  const supabase = createClient();
  const { error } = await supabase.from('canvas_edges').delete().eq('id', id);
  if (error) throw error;
};

export const insertComment = async (comment: TablesInsert<'comments'>) => {
  const supabase = createClient();
  const { error } = await supabase.from('comments').insert(comment);
  if (error) throw error;
};

export const syncCanvasData = async (
  topicId: string,
  nodes: TablesInsert<'canvas_nodes'>[],
  edges: TablesInsert<'canvas_edges'>[],
  comments: TablesInsert<'comments'>[]
) => {
  const supabase = createClient();

  if (nodes.length > 0) {
    const { error } = await supabase.from('canvas_nodes').upsert(nodes);
    if (error) throw error;
  }
  if (edges.length > 0) {
    const { error } = await supabase.from('canvas_edges').upsert(edges);
    if (error) throw error;
  }
  if (comments.length > 0) {
    const { error } = await supabase.from('comments').upsert(comments);
    if (error) throw error;
  }

  const nodeIds = nodes.map((n) => n.id).filter(Boolean) as string[];
  const edgeIds = edges.map((e) => e.id).filter(Boolean) as string[];

  let edgeDelete = supabase
    .from('canvas_edges')
    .delete()
    .eq('topic_id', topicId);
  if (edgeIds.length > 0) {
    edgeDelete = edgeDelete.not('id', 'in', `(${edgeIds.join(',')})`);
  }
  const { error: edgeDeleteError } = await edgeDelete;
  if (edgeDeleteError) throw edgeDeleteError;

  let nodeDelete = supabase
    .from('canvas_nodes')
    .delete()
    .eq('topic_id', topicId);
  if (nodeIds.length > 0) {
    nodeDelete = nodeDelete.not('id', 'in', `(${nodeIds.join(',')})`);
  }
  const { error: nodeDeleteError } = await nodeDelete;
  if (nodeDeleteError) throw nodeDeleteError;
};
