import type { ICreateNodeCommentInput, INodeCommentRow } from '@interfaces';
import { createClient } from '@/lib/supabase';
import { getCurrentUserId } from './utils';

export const createNodeComment = async (input: ICreateNodeCommentInput): Promise<void> => {
  const authorId = await getCurrentUserId();
  const supabase = createClient();

  const { error } = await supabase.from('node_comments').insert({
    id: input.id,
    node_id: input.nodeId,
    author_id: authorId,
    text: input.text,
  });

  if (error) throw error;
};

export const deleteNodeComment = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('node_comments').delete().eq('id', id);

  if (error) throw error;
};

export const getNodeComments = async (nodeIds: string[]): Promise<INodeCommentRow[]> => {
  if (nodeIds.length === 0) return [];

  const supabase = createClient();

  const { data, error } = await supabase
    .from('node_comments')
    .select('id, node_id, author_id, text, created_at')
    .in('node_id', nodeIds)
    .order('created_at')
    .returns<INodeCommentRow[]>();

  if (error) throw error;

  return data ?? [];
};
