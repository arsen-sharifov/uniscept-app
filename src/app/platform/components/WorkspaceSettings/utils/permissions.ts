import type {
  IWorkspaceAccess,
  IWorkspaceInvitation,
  IWorkspaceRole,
  IWorkspaceRolePermissions,
  TRolePermissionKey,
} from '@interfaces';

import { PERMISSION_DEFINITIONS } from '../consts';

export const canGrantPermission = (key: TRolePermissionKey, granter: IWorkspaceAccess | null): boolean =>
  granter !== null && (granter.isOwner || granter[key]);

export const canGrantRole = (role: IWorkspaceRolePermissions, granter: IWorkspaceAccess | null): boolean =>
  granter !== null && PERMISSION_DEFINITIONS.every(({ key }) => !role[key] || canGrantPermission(key, granter));

export const canReassignRoleHolders = (
  role: IWorkspaceRole,
  fallbackRole: IWorkspaceRolePermissions | undefined,
  invitations: IWorkspaceInvitation[],
  granter: IWorkspaceAccess | null,
): boolean =>
  (role.memberCount === 0 && !invitations.some((invitation) => invitation.roleId === role.id)) ||
  (fallbackRole !== undefined && canGrantRole(fallbackRole, granter));
