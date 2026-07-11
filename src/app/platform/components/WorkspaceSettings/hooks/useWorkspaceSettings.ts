'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  IWorkspace,
  IWorkspaceInvitation,
  IWorkspaceMember,
  IWorkspaceRole,
  IWorkspaceRolePermissions,
} from '@interfaces';
import {
  createWorkspaceInvitation,
  createWorkspaceRole,
  deleteWorkspaceRole,
  getMyWorkspacePermissions,
  getUser,
  getWorkspace,
  getWorkspaceInvitations,
  getWorkspaceMembers,
  getWorkspaceRoles,
  removeWorkspaceMember,
  revokeWorkspaceInvitation,
  setMemberRole,
  transferWorkspaceOwnership,
  updateWorkspaceRole,
} from '@api/client';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { usePermissionsStore } from '@/lib/stores';
import { roleLabel } from '@/lib/utils';

export const useWorkspaceSettings = (workspaceId: string, onWorkspacesChanged?: () => void) => {
  const t = useTranslations();
  const ws = t.platform.workspaceSettings;

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<IWorkspace | null>(null);
  const [members, setMembers] = useState<IWorkspaceMember[]>([]);
  const [roles, setRoles] = useState<IWorkspaceRole[]>([]);
  const [invitations, setInvitations] = useState<IWorkspaceInvitation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentMember = useMemo(
    () => members.find((member) => member.userId === currentUserId) ?? null,
    [members, currentUserId],
  );
  const myRole = useMemo(() => roles.find((role) => role.id === currentMember?.roleId) ?? null, [roles, currentMember]);

  const canManageMembers = myRole?.canManageMembers ?? false;
  const canManageRoles = myRole?.canManageRoles ?? false;
  const canManageWorkspace = myRole?.canManageWorkspace ?? false;
  const currentRoleName = currentMember ? roleLabel(currentMember.roleKey, currentMember.roleName, t) : null;

  const refreshMembers = useCallback(
    () =>
      getWorkspaceMembers(workspaceId)
        .then(setMembers)
        .catch((error) => event.error(error, { toast: false, context: 'workspaceSettings.refreshMembers' })),
    [workspaceId],
  );

  const refreshRoles = useCallback(
    () =>
      getWorkspaceRoles(workspaceId)
        .then(setRoles)
        .catch((error) => event.error(error, { toast: false, context: 'workspaceSettings.refreshRoles' })),
    [workspaceId],
  );

  const refreshInvitations = useCallback(
    () =>
      getWorkspaceInvitations(workspaceId)
        .then(setInvitations)
        .catch((error) => event.error(error, { toast: false, context: 'workspaceSettings.refreshInvitations' })),
    [workspaceId],
  );

  const refreshMyAccess = useCallback(async () => {
    if (usePermissionsStore.getState().workspaceId !== workspaceId) return;

    await Promise.all([getUser(), getMyWorkspacePermissions(workspaceId)])
      .then(([{ data }, access]) =>
        usePermissionsStore.getState().setAccess(workspaceId, data.user?.id ?? null, access),
      )
      .catch((error) => event.error(error, { toast: false, context: 'workspaceSettings.refreshAccess' }));
  }, [workspaceId]);

  const syncMyAccess = useCallback(
    async (affectsMe: boolean) => {
      if (!affectsMe) return;

      await refreshMyAccess();
      onWorkspacesChanged?.();
    },
    [refreshMyAccess, onWorkspacesChanged],
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [{ data }, workspaceData, roleList, memberList] = await Promise.all([
        getUser(),
        getWorkspace(workspaceId),
        getWorkspaceRoles(workspaceId),
        getWorkspaceMembers(workspaceId),
      ]);

      if (cancelled) return;

      const uid = data.user?.id ?? null;
      setCurrentUserId(uid);
      setWorkspace(workspaceData);
      setRoles(roleList);
      setMembers(memberList);

      const mine = roleList.find((role) => role.id === memberList.find((member) => member.userId === uid)?.roleId);
      if (mine?.canManageMembers) {
        const inviteList = await getWorkspaceInvitations(workspaceId).catch((error) => {
          event.error(error, { toast: false, context: 'workspaceSettings.loadInvitations' });

          return [];
        });
        if (!cancelled) setInvitations(inviteList);
      }

      setLoading(false);
    };

    load().catch((error) => {
      if (cancelled) return;
      setLoading(false);
      event.error(error, { title: t.common.errorTitles.loadFailed, context: 'workspaceSettings.load' });
    });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, t]);

  const assignRole = useCallback(
    async (userId: string, roleId: string) => {
      const target = roles.find((role) => role.id === roleId);
      setMembers((prev) =>
        prev.map((member) =>
          member.userId === userId
            ? { ...member, roleId, roleKey: target?.key ?? null, roleName: target?.name ?? member.roleName }
            : member,
        ),
      );

      try {
        await setMemberRole(workspaceId, userId, roleId);
        await refreshRoles();
        await syncMyAccess(userId === currentUserId);
        event.success(ws.members.roleChanged);
      } catch (error) {
        event.error(error, { title: ws.members.roleChangeFailed, context: 'workspaceSettings.assignRole' });
        await Promise.all([refreshMembers(), refreshRoles()]);
      }
    },
    [workspaceId, roles, currentUserId, refreshMembers, refreshRoles, syncMyAccess, ws],
  );

  const removeMember = useCallback(
    async (userId: string) => {
      setMembers((prev) => prev.filter((member) => member.userId !== userId));

      try {
        await removeWorkspaceMember(workspaceId, userId);
        await refreshRoles();
        event.success(ws.members.removed);
      } catch (error) {
        event.error(error, { title: ws.members.removeFailed, context: 'workspaceSettings.removeMember' });
        await refreshMembers();
      }
    },
    [workspaceId, refreshMembers, refreshRoles, ws],
  );

  const transferOwnership = useCallback(
    async (userId: string) => {
      const ok = await transferWorkspaceOwnership(workspaceId, userId)
        .then(() => true)
        .catch((error) => {
          event.error(error, { title: ws.members.transferFailed, context: 'workspaceSettings.transferOwnership' });

          return false;
        });
      if (!ok) return;

      await Promise.all([refreshMembers(), refreshRoles(), refreshMyAccess()]);
      onWorkspacesChanged?.();
      event.success(ws.members.transferred);
    },
    [workspaceId, refreshMembers, refreshRoles, refreshMyAccess, onWorkspacesChanged, ws],
  );

  const invite = useCallback(
    async (email: string, roleId: string): Promise<boolean> => {
      const ok = await createWorkspaceInvitation(workspaceId, email, roleId)
        .then(() => true)
        .catch((error) => {
          event.error(error, { title: ws.members.inviteFailed, context: 'workspaceSettings.invite' });

          return false;
        });
      if (!ok) return false;

      await refreshInvitations();
      event.success(ws.members.invited);

      return true;
    },
    [workspaceId, refreshInvitations, ws],
  );

  const revokeInvitation = useCallback(
    async (invitationId: string) => {
      setInvitations((prev) => prev.filter((invitation) => invitation.id !== invitationId));

      try {
        await revokeWorkspaceInvitation(invitationId);
        event.success(ws.members.revoked);
      } catch (error) {
        event.error(error, { title: ws.members.revokeFailed, context: 'workspaceSettings.revokeInvitation' });
        await refreshInvitations();
      }
    },
    [refreshInvitations, ws],
  );

  const createRole = useCallback(
    async (name: string, icon: string, permissions: IWorkspaceRolePermissions): Promise<boolean> => {
      const ok = await createWorkspaceRole(workspaceId, name, icon, permissions)
        .then(() => true)
        .catch((error) => {
          event.error(error, { title: ws.roles.createFailed, context: 'workspaceSettings.createRole' });

          return false;
        });
      if (!ok) return false;

      await refreshRoles();
      event.success(ws.roles.created);

      return true;
    },
    [workspaceId, refreshRoles, ws],
  );

  const updateRole = useCallback(
    async (roleId: string, name: string, icon: string, permissions: IWorkspaceRolePermissions): Promise<boolean> => {
      const ok = await updateWorkspaceRole(roleId, name, icon, permissions)
        .then(() => true)
        .catch((error) => {
          event.error(error, { title: ws.roles.updateFailed, context: 'workspaceSettings.updateRole' });

          return false;
        });
      if (!ok) return false;

      await refreshRoles();
      await syncMyAccess(roleId === currentMember?.roleId);
      event.success(ws.roles.updated);

      return true;
    },
    [refreshRoles, syncMyAccess, currentMember, ws],
  );

  const deleteRole = useCallback(
    async (roleId: string) => {
      const ok = await deleteWorkspaceRole(roleId)
        .then(() => true)
        .catch((error) => {
          event.error(error, { title: ws.roles.deleteFailed, context: 'workspaceSettings.deleteRole' });

          return false;
        });
      if (!ok) return;

      await Promise.all([refreshRoles(), refreshMembers()]);
      await syncMyAccess(roleId === currentMember?.roleId);
      event.success(ws.roles.deleted);
    },
    [refreshRoles, refreshMembers, syncMyAccess, currentMember, ws],
  );

  return {
    loading,
    workspace,
    members,
    roles,
    invitations,
    currentUserId,
    canManageMembers,
    canManageRoles,
    canManageWorkspace,
    currentRoleName,
    assignRole,
    removeMember,
    transferOwnership,
    invite,
    revokeInvitation,
    createRole,
    updateRole,
    deleteRole,
  };
};
