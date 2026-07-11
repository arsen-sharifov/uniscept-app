import type { IWorkspaceMember, IWorkspaceMemberRow } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { toWorkspaceMember } from './utils';

export const getWorkspaceMembers = async (workspaceId: string): Promise<IWorkspaceMember[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_workspace_members', { p_workspace_id: workspaceId });

  if (error) throw error;

  return ((data ?? []) as IWorkspaceMemberRow[]).map(toWorkspaceMember);
};

export const setMemberRole = async (workspaceId: string, userId: string, roleId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.rpc('set_member_role', {
    p_workspace_id: workspaceId,
    p_user_id: userId,
    p_role_id: roleId,
  });

  if (error) throw error;
};

export const removeWorkspaceMember = async (workspaceId: string, userId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.rpc('remove_workspace_member', {
    p_workspace_id: workspaceId,
    p_user_id: userId,
  });

  if (error) throw error;
};

export const transferWorkspaceOwnership = async (workspaceId: string, newOwnerId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.rpc('transfer_workspace_ownership', {
    p_workspace_id: workspaceId,
    p_new_owner_id: newOwnerId,
  });

  if (error) throw error;
};
