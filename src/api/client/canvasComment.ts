import type { ICanvasCommentRow, ICreateCanvasCommentInput } from '@interfaces';
import { createClient } from '@/lib/supabase';
import { getCurrentUserId } from './utils';

export const createCanvasComment = async (input: ICreateCanvasCommentInput): Promise<void> => {
  const authorId = await getCurrentUserId();
  const supabase = createClient();

  const { error } = await supabase.from('canvas_comments').insert({
    id: input.id,
    thread_id: input.threadId,
    author_id: authorId,
    text: input.text,
  });

  if (error) throw error;
};

export const deleteCanvasComment = async (id: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.from('canvas_comments').delete().eq('id', id);

  if (error) throw error;
};

export const getCanvasComments = async (threadId: string): Promise<ICanvasCommentRow[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('canvas_comments')
    .select('id, thread_id, author_id, text, created_at')
    .eq('thread_id', threadId)
    .order('created_at')
    .returns<ICanvasCommentRow[]>();

  if (error) throw error;

  return data ?? [];
};
