import type { IFolder, IFolderRow } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { toFolder } from './utils';

export const getFolders = async (workspaceId: string): Promise<IFolder[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('folders')
    .select('id, workspace_id, parent_folder_id, name, position')
    .eq('workspace_id', workspaceId)
    .order('position')
    .returns<IFolderRow[]>();

  if (error) throw error;

  return (data ?? []).map(toFolder);
};

export const createFolder = async (workspaceId: string, parentFolderId?: string): Promise<IFolder | null> => {
  const supabase = createClient();

  let countQuery = supabase
    .from('folders')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  if (parentFolderId) {
    countQuery = countQuery.eq('parent_folder_id', parentFolderId);
  } else {
    countQuery = countQuery.is('parent_folder_id', null);
  }

  const { count, error: countError } = await countQuery;

  if (countError) throw countError;

  const { data, error: insertError } = await supabase
    .from('folders')
    .insert({
      workspace_id: workspaceId,
      parent_folder_id: parentFolderId ?? null,
      position: count ?? 0,
    })
    .select('id, workspace_id, parent_folder_id, name, position')
    .single<IFolderRow>();

  if (insertError) throw insertError;

  return data ? toFolder(data) : null;
};

export const updateFolderName = async (id: string, name: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('folders').update({ name }).eq('id', id);

  if (error) throw error;
};

export const deleteFolder = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('folders').delete().eq('id', id);

  if (error) throw error;
};

export const deleteFolders = async (ids: string[]): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('folders').delete().in('id', ids);

  if (error) throw error;
};

export const moveFolder = async (id: string, parentFolderId: string | null, position: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('folders').update({ parent_folder_id: parentFolderId, position }).eq('id', id);

  if (error) throw error;
};
