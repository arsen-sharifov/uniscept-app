import type { INodeCommentRow } from '@interfaces';
import { createClient } from '@/lib/supabase/client';

interface ICreateNodeCommentInput {
  id: string;
  nodeId: string;
  text: string;
}

export const createNodeComment = async (input: ICreateNodeCommentInput) => {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  const authorId = userData.user?.id;
  if (!authorId) throw new Error('Cannot create comment without an author');

  return supabase.from('node_comments').insert({
    id: input.id,
    node_id: input.nodeId,
    author_id: authorId,
    text: input.text,
  });
};

export const deleteNodeComment = async (id: string) => {
  const supabase = createClient();
  return supabase.from('node_comments').delete().eq('id', id);
};

export const getNodeComments = async (
  nodeIds: string[]
): Promise<INodeCommentRow[]> => {
  if (nodeIds.length === 0) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('node_comments')
    .select('id, node_id, author_id, text, created_at')
    .in('node_id', nodeIds)
    .order('created_at');
  return (data as INodeCommentRow[] | null) ?? [];
};
