import type { IWorkspace, IWorkspaceRow } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { getUser } from './user';
import { toWorkspace } from './utils';

export const getWorkspaces = async (): Promise<IWorkspace[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, name, owner_id, created_at, position')
    .order('position')
    .returns<IWorkspaceRow[]>();

  if (error) throw error;

  return (data ?? []).map(toWorkspace);
};

export const createWorkspace = async (name: string): Promise<IWorkspace | null> => {
  const {
    data: { user },
  } = await getUser();
  if (!user) return null;

  const supabase = createClient();

  const { count, error: countError } = await supabase
    .from('workspaces')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id);

  if (countError) throw countError;

  const { data, error: insertError } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: user.id, position: count ?? 0 })
    .select('id, name, owner_id, created_at, position')
    .single<IWorkspaceRow>();

  if (insertError) throw insertError;
  if (!data) return null;

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: data.id, user_id: user.id, role: 'owner' });

  if (memberError) throw memberError;

  return toWorkspace(data);
};

export const updateWorkspaceName = async (id: string, name: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').update({ name }).eq('id', id);

  if (error) throw error;
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').delete().eq('id', id);

  if (error) throw error;
};

export const deleteWorkspaces = async (ids: string[]): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').delete().in('id', ids);

  if (error) throw error;
};

export const moveWorkspace = async (id: string, position: number): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from('workspaces').update({ position }).eq('id', id);

  if (error) throw error;
};
