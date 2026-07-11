import type { IWorkspaceRole, IWorkspaceRolePermissions, IWorkspaceRoleRow } from '@interfaces';

import { createClient } from '@/lib/supabase';

import { toWorkspaceRole } from './utils';

export const getWorkspaceRoles = async (workspaceId: string): Promise<IWorkspaceRole[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_workspace_roles', { p_workspace_id: workspaceId });

  if (error) throw error;

  return ((data ?? []) as IWorkspaceRoleRow[]).map(toWorkspaceRole);
};

export const createWorkspaceRole = async (
  workspaceId: string,
  name: string,
  icon: string,
  permissions: IWorkspaceRolePermissions,
): Promise<string> => {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_workspace_role', {
    p_workspace_id: workspaceId,
    p_name: name,
    p_icon: icon,
    p_can_edit_canvas: permissions.canEditCanvas,
    p_can_comment: permissions.canComment,
    p_can_manage_structure: permissions.canManageStructure,
    p_can_manage_members: permissions.canManageMembers,
    p_can_manage_roles: permissions.canManageRoles,
    p_can_manage_workspace: permissions.canManageWorkspace,
  });

  if (error) throw error;

  return data as string;
};

export const updateWorkspaceRole = async (
  roleId: string,
  name: string,
  icon: string,
  permissions: IWorkspaceRolePermissions,
): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.rpc('update_workspace_role', {
    p_role_id: roleId,
    p_name: name,
    p_icon: icon,
    p_can_edit_canvas: permissions.canEditCanvas,
    p_can_comment: permissions.canComment,
    p_can_manage_structure: permissions.canManageStructure,
    p_can_manage_members: permissions.canManageMembers,
    p_can_manage_roles: permissions.canManageRoles,
    p_can_manage_workspace: permissions.canManageWorkspace,
  });

  if (error) throw error;
};

export const deleteWorkspaceRole = async (roleId: string): Promise<void> => {
  const supabase = createClient();

  const { error } = await supabase.rpc('delete_workspace_role', { p_role_id: roleId });

  if (error) throw error;
};
