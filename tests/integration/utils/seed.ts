import { randomUUID } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import { CUSTOM_ROLE_POSITION, INTEGRATION_ACCOUNT_DOMAIN, INTEGRATION_ACCOUNT_PASSWORD } from '../consts';
import type {
  IIntegrationAccount,
  IIntegrationInvitationRow,
  IIntegrationNodeRow,
  IIntegrationRoleFlags,
  IIntegrationThread,
  IIntegrationWorkspace,
  TIntegrationRoleKey,
} from '../interfaces';
import { createUserClient, getAdminClient } from './clients';

const userClients = new Map<string, Promise<SupabaseClient>>();

export const uniqueLabel = (prefix: string): string => `${prefix}-${randomUUID().slice(0, 8)}`;

export const seedAccount = async (label: string): Promise<IIntegrationAccount> => {
  const email = `${uniqueLabel(label)}@${INTEGRATION_ACCOUNT_DOMAIN}`;
  const { data, error } = await getAdminClient().auth.admin.createUser({
    email,
    password: INTEGRATION_ACCOUNT_PASSWORD,
    email_confirm: true,
    user_metadata: { name: `Integration ${label}` },
  });

  if (error || !data.user) {
    throw new Error(`Could not create the integration account ${email}: ${error?.message ?? 'no user returned'}`);
  }

  return { id: data.user.id, email, password: INTEGRATION_ACCOUNT_PASSWORD };
};

export const deleteAccount = async (userId: string): Promise<void> => {
  const { error } = await getAdminClient().auth.admin.deleteUser(userId);

  if (error) throw new Error(`Could not delete the integration account ${userId}: ${error.message}`);
};

export const deleteAccounts = async (...accounts: Array<IIntegrationAccount | undefined>): Promise<void> => {
  const failures: string[] = [];

  await accounts
    .filter((account) => account !== undefined)
    .reduce(
      (chain, account) =>
        chain.then(() =>
          deleteAccount(account.id).catch((error: unknown) => {
            failures.push(error instanceof Error ? error.message : String(error));
          }),
        ),
      Promise.resolve(),
    );

  if (failures.length > 0) throw new Error(failures.join('; '));
};

export const getUserClient = (account: IIntegrationAccount): Promise<SupabaseClient> => {
  const cached = userClients.get(account.email) ?? createUserClient(account.email, account.password);
  userClients.set(account.email, cached);

  return cached;
};

export const seedWorkspace = async (ownerId: string, name: string): Promise<IIntegrationWorkspace> => {
  const { data, error } = await getAdminClient()
    .from('workspaces')
    .insert({ name, owner_id: ownerId })
    .select('id, name')
    .single<IIntegrationWorkspace>();

  if (error || !data) throw new Error(`Could not seed the workspace "${name}": ${error?.message ?? 'no row returned'}`);

  return data;
};

export const getRoleId = async (workspaceId: string, key: TIntegrationRoleKey): Promise<string> => {
  const { data, error } = await getAdminClient()
    .from('workspace_roles')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('key', key)
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(`Could not read the "${key}" role of ${workspaceId}: ${error?.message ?? 'no row returned'}`);
  }

  return data.id;
};

export const seedRole = async (workspaceId: string, name: string, flags: IIntegrationRoleFlags): Promise<string> => {
  const { data, error } = await getAdminClient()
    .from('workspace_roles')
    .insert({
      workspace_id: workspaceId,
      name,
      can_edit_canvas: flags.canEditCanvas ?? false,
      can_comment: flags.canComment ?? false,
      can_manage_structure: flags.canManageStructure ?? false,
      can_manage_members: flags.canManageMembers ?? false,
      can_manage_roles: flags.canManageRoles ?? false,
      can_manage_workspace: flags.canManageWorkspace ?? false,
      position: CUSTOM_ROLE_POSITION,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) throw new Error(`Could not seed the role "${name}": ${error?.message ?? 'no row returned'}`);

  return data.id;
};

export const seedMemberWithRole = async (workspaceId: string, userId: string, roleId: string): Promise<void> => {
  const { error } = await getAdminClient()
    .from('workspace_members')
    .insert({ workspace_id: workspaceId, user_id: userId, role_id: roleId, position: 0 });

  if (error) throw new Error(`Could not add ${userId} to ${workspaceId}: ${error.message}`);
};

export const seedMember = async (
  workspaceId: string,
  userId: string,
  key: Exclude<TIntegrationRoleKey, 'owner'>,
): Promise<void> => {
  const roleId = await getRoleId(workspaceId, key);
  await seedMemberWithRole(workspaceId, userId, roleId);
};

export const setMemberRole = async (workspaceId: string, userId: string, roleId: string): Promise<void> => {
  const { error } = await getAdminClient()
    .from('workspace_members')
    .update({ role_id: roleId })
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw new Error(`Could not set the role of ${userId} in ${workspaceId}: ${error.message}`);
};

export const readMemberRole = async (workspaceId: string, userId: string): Promise<string> => {
  const { data, error } = await getAdminClient()
    .from('workspace_members')
    .select('role_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single<{ role_id: string }>();

  if (error || !data) throw new Error(`Could not read the membership of ${userId}: ${error?.message ?? 'no row'}`);

  return data.role_id;
};

export const isMember = async (workspaceId: string, userId: string): Promise<boolean> => {
  const { data, error } = await getAdminClient()
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle<{ user_id: string }>();

  if (error) throw new Error(`Could not read the membership of ${userId}: ${error.message}`);

  return data !== null;
};

export const removeMember = async (workspaceId: string, userId: string): Promise<void> => {
  const { error } = await getAdminClient()
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId);

  if (error) throw new Error(`Could not remove ${userId} from ${workspaceId}: ${error.message}`);
};

export const seedInvitation = async (workspaceId: string, email: string, roleId: string): Promise<string> => {
  const { data, error } = await getAdminClient()
    .from('workspace_invitations')
    .insert({ workspace_id: workspaceId, email: email.toLowerCase(), role_id: roleId })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) throw new Error(`Could not seed an invitation for ${email}: ${error?.message ?? 'no row'}`);

  return data.id;
};

export const deleteInvitations = async (workspaceId: string, email: string): Promise<void> => {
  const { error } = await getAdminClient()
    .from('workspace_invitations')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('email', email.toLowerCase());

  if (error) throw new Error(`Could not delete the invitations of ${email}: ${error.message}`);
};

export const readInvitation = async (invitationId: string): Promise<IIntegrationInvitationRow | null> => {
  const { data, error } = await getAdminClient()
    .from('workspace_invitations')
    .select('status')
    .eq('id', invitationId)
    .maybeSingle<IIntegrationInvitationRow>();

  if (error) throw new Error(`Could not read the invitation ${invitationId}: ${error.message}`);

  return data;
};

export const seedThread = async (workspaceId: string, createdBy: string): Promise<IIntegrationThread> => {
  const { data, error } = await getAdminClient()
    .from('threads')
    .insert({ workspace_id: workspaceId, name: uniqueLabel('thread') })
    .select('id')
    .single<{ id: string }>();

  if (error || !data)
    throw new Error(`Could not seed a thread on ${workspaceId}: ${error?.message ?? 'no row returned'}`);

  const questionNodeId = await seedNode(data.id, createdBy, { type: 'question-node' });

  return { id: data.id, questionNodeId };
};

export const seedNode = async (
  threadId: string,
  createdBy: string,
  options: { type?: string; label?: string } = {},
): Promise<string> => {
  const { data, error } = await getAdminClient()
    .from('canvas_nodes')
    .insert({
      thread_id: threadId,
      type: options.type ?? 'canvas-node',
      position_x: 0,
      position_y: 0,
      label: options.label ?? '',
      created_by: createdBy,
    })
    .select('id')
    .single<{ id: string }>();

  if (error || !data) {
    throw new Error(`Could not seed a node on ${threadId}: ${error?.message ?? 'no row returned'}`);
  }

  return data.id;
};

export const readNode = async (nodeId: string): Promise<IIntegrationNodeRow | null> => {
  const { data, error } = await getAdminClient()
    .from('canvas_nodes')
    .select('label, status, is_answer, position_x, position_y')
    .eq('id', nodeId)
    .maybeSingle<IIntegrationNodeRow>();

  if (error) throw new Error(`Could not read the node ${nodeId}: ${error.message}`);

  return data;
};

export const readWorkspaceRole = async (roleId: string, columns: string): Promise<Record<string, unknown> | null> => {
  const { data, error } = await getAdminClient()
    .from('workspace_roles')
    .select(columns)
    .eq('id', roleId)
    .maybeSingle<Record<string, unknown>>();

  if (error) throw new Error(`Could not read the role ${roleId}: ${error.message}`);

  return data;
};

export const readWorkspaceOwner = async (workspaceId: string): Promise<string | null> => {
  const { data, error } = await getAdminClient()
    .from('workspaces')
    .select('owner_id')
    .eq('id', workspaceId)
    .maybeSingle<{ owner_id: string }>();

  if (error) throw new Error(`Could not read the owner of ${workspaceId}: ${error.message}`);

  return data?.owner_id ?? null;
};
