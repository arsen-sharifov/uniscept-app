import type {
  IWorkspaceAccess,
  IWorkspaceInvitation,
  IWorkspaceMember,
  IWorkspaceRole,
  IWorkspaceRolePermissions,
} from '@interfaces';

export const OWNER = { userId: 'user-1', isOwner: true, canEditCanvas: true };
export const EDITOR = { userId: 'user-1', isOwner: false, canEditCanvas: true };
export const VIEWER = { userId: 'user-1', isOwner: false, canEditCanvas: false };

export const FULL_ACCESS: IWorkspaceAccess = {
  isOwner: true,
  canEditCanvas: true,
  canComment: true,
  canManageStructure: true,
  canManageMembers: true,
  canManageRoles: true,
  canManageWorkspace: true,
};

export const EDIT_ACCESS: IWorkspaceAccess = {
  isOwner: false,
  canEditCanvas: true,
  canComment: true,
  canManageStructure: false,
  canManageMembers: false,
  canManageRoles: false,
  canManageWorkspace: false,
};

export const COMMENT_ACCESS: IWorkspaceAccess = {
  isOwner: false,
  canEditCanvas: false,
  canComment: true,
  canManageStructure: false,
  canManageMembers: false,
  canManageRoles: false,
  canManageWorkspace: false,
};

export const READONLY_ACCESS: IWorkspaceAccess = {
  isOwner: false,
  canEditCanvas: false,
  canComment: false,
  canManageStructure: false,
  canManageMembers: false,
  canManageRoles: false,
  canManageWorkspace: false,
};

export const ROLE_PERMISSIONS: IWorkspaceRolePermissions = {
  canEditCanvas: true,
  canComment: true,
  canManageStructure: true,
  canManageMembers: false,
  canManageRoles: false,
  canManageWorkspace: false,
};

export const workspaceRole = (id: string, overrides: Partial<IWorkspaceRole> = {}): IWorkspaceRole => ({
  id,
  key: null,
  name: `Role ${id}`,
  icon: null,
  isSystem: false,
  isOwner: false,
  memberCount: 1,
  ...ROLE_PERMISSIONS,
  ...overrides,
});

export const workspaceMember = (
  userId: string,
  roleId: string,
  overrides: Partial<IWorkspaceMember> = {},
): IWorkspaceMember => ({
  userId,
  roleId,
  roleKey: null,
  roleName: `Role ${roleId}`,
  isOwner: false,
  name: `User ${userId}`,
  email: `${userId}@uniscept.dev`,
  avatarIcon: null,
  joinedAt: '2026-01-05T00:00:00Z',
  ...overrides,
});

export const workspaceInvitation = (id: string): IWorkspaceInvitation => ({
  id,
  email: `${id}@uniscept.dev`,
  roleId: 'role-member',
  roleKey: 'member',
  roleName: 'Member',
  createdAt: '2026-01-06T00:00:00Z',
});
