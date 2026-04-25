import type { IWorkspace, IWorkspaceRow } from '@interfaces';
import { createClient } from '@/lib/supabase/client';
import { getUser } from './user';
import { toWorkspace } from './utils';

export const getWorkspaces = async (): Promise<IWorkspace[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('workspaces')
    .select('id, name, owner_id, created_at, position')
    .order('position');

  if (!data) return [];

  return data.map((workspace) => toWorkspace(workspace as IWorkspaceRow));
};

export const createWorkspace = async (
  name: string
): Promise<IWorkspace | null> => {
  const {
    data: { user },
  } = await getUser();
  if (!user) return null;

  const supabase = createClient();

  const { count } = await supabase
    .from('workspaces')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  const { data } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: user.id, position: count ?? 0 })
    .select('id, name, owner_id, created_at, position')
    .single();

  if (!data) return null;

  await supabase
    .from('workspace_members')
    .insert({ workspace_id: data.id, user_id: user.id, role: 'owner' });

  return toWorkspace(data as IWorkspaceRow);
};

export const renameWorkspace = async (id: string, name: string) => {
  const supabase = createClient();
  return supabase.from('workspaces').update({ name }).eq('id', id);
};

export const deleteWorkspace = async (id: string) => {
  const supabase = createClient();
  return supabase.from('workspaces').delete().eq('id', id);
};

export const deleteWorkspaces = async (ids: string[]) => {
  const supabase = createClient();
  return supabase.from('workspaces').delete().in('id', ids);
};

export const moveWorkspace = async (id: string, position: number) => {
  const supabase = createClient();
  return supabase.from('workspaces').update({ position }).eq('id', id);
};
