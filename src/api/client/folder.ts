import type { IFolder, IFolderRow } from '@interfaces';
import { createClient } from '@/lib/supabase/client';
import { toFolder } from './utils';

export const getFolders = async (workspaceId: string): Promise<IFolder[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('folders')
    .select('id, workspace_id, parent_folder_id, name, position')
    .eq('workspace_id', workspaceId)
    .order('position');

  if (!data) return [];

  return data.map((folder) => toFolder(folder as IFolderRow));
};

export const createFolder = async (
  workspaceId: string,
  parentFolderId?: string
): Promise<IFolder | null> => {
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

  const { count } = await countQuery;

  const { data } = await supabase
    .from('folders')
    .insert({
      workspace_id: workspaceId,
      parent_folder_id: parentFolderId ?? null,
      position: count ?? 0,
    })
    .select('id, workspace_id, parent_folder_id, name, position')
    .single();

  if (!data) return null;

  return toFolder(data as IFolderRow);
};

export const renameFolder = async (id: string, name: string) => {
  const supabase = createClient();
  return supabase.from('folders').update({ name }).eq('id', id);
};

export const deleteFolder = async (id: string) => {
  const supabase = createClient();
  return supabase.from('folders').delete().eq('id', id);
};

export const deleteFolders = async (ids: string[]) => {
  const supabase = createClient();
  return supabase.from('folders').delete().in('id', ids);
};

export const moveFolder = async (
  id: string,
  parentFolderId: string | null,
  position: number
) => {
  const supabase = createClient();
  return supabase
    .from('folders')
    .update({ parent_folder_id: parentFolderId, position })
    .eq('id', id);
};
