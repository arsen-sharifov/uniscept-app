import type { IThread, IThreadRow } from '@interfaces';
import { createClient } from '@/lib/supabase/client';
import { toThread } from './utils';

export const getThreads = async (
  workspaceId: string
): Promise<Omit<IThread, 'canvasData'>[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('threads')
    .select('id, workspace_id, folder_id, name, position')
    .eq('workspace_id', workspaceId)
    .order('position');

  if (!data) return [];

  return data.map((thread) => toThread(thread as IThreadRow));
};

export const createThread = async (
  workspaceId: string,
  folderId?: string
): Promise<Omit<IThread, 'canvasData'> | null> => {
  const supabase = createClient();

  let countQuery = supabase
    .from('threads')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  if (folderId) {
    countQuery = countQuery.eq('folder_id', folderId);
  } else {
    countQuery = countQuery.is('folder_id', null);
  }

  const { count } = await countQuery;

  const { data } = await supabase
    .from('threads')
    .insert({
      workspace_id: workspaceId,
      folder_id: folderId ?? null,
      position: count ?? 0,
    })
    .select('id, workspace_id, folder_id, name, position')
    .single();

  if (!data) return null;

  return toThread(data as IThreadRow);
};

export const renameThread = async (id: string, name: string) => {
  const supabase = createClient();
  return supabase.from('threads').update({ name }).eq('id', id);
};

export const deleteThread = async (id: string) => {
  const supabase = createClient();
  return supabase.from('threads').delete().eq('id', id);
};

export const deleteThreads = async (ids: string[]) => {
  const supabase = createClient();
  return supabase.from('threads').delete().in('id', ids);
};

export const moveThread = async (
  id: string,
  folderId: string | null,
  position: number
) => {
  const supabase = createClient();
  return supabase
    .from('threads')
    .update({ folder_id: folderId, position })
    .eq('id', id);
};
