import type { IThread, IThreadRow } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { toThread } from './utils';

export const getThreads = async (workspaceId: string): Promise<IThread[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('threads')
    .select('id, workspace_id, folder_id, name, position')
    .eq('workspace_id', workspaceId)
    .order('position')
    .returns<IThreadRow[]>();

  if (error) throw error;

  return (data ?? []).map(toThread);
};

export const createThread = async (workspaceId: string, folderId?: string): Promise<IThread | null> => {
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

  const { count, error: countError } = await countQuery;

  if (countError) throw countError;

  const { data, error: insertError } = await supabase
    .from('threads')
    .insert({
      workspace_id: workspaceId,
      folder_id: folderId ?? null,
      position: count ?? 0,
    })
    .select('id, workspace_id, folder_id, name, position')
    .single<IThreadRow>();

  if (insertError) throw insertError;

  return data ? toThread(data) : null;
};

export const updateThreadName = async (id: string, name: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('threads').update({ name }).eq('id', id);

  if (error) throw error;
};

export const deleteThread = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('threads').delete().eq('id', id);

  if (error) throw error;
};

export const deleteThreads = async (ids: string[]): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('threads').delete().in('id', ids);

  if (error) throw error;
};

export const moveThread = async (id: string, folderId: string | null, position: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('threads').update({ folder_id: folderId, position }).eq('id', id);

  if (error) throw error;
};
