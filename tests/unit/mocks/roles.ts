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

export const OWNER_ROLE = workspaceRole('role-owner', { ...FULL_ACCESS, key: 'owner', name: 'Owner', isSystem: true });

export const MEMBER_ROLE = workspaceRole('role-member', { key: 'member', name: 'Member', isSystem: true });

export const MANAGER_ROLE = workspaceRole('role-manager', { name: 'Manager', canManageRoles: true });

export const MEMBER_MANAGER_ROLE = workspaceRole('role-manager', { name: 'Manager', canManageMembers: true });

export const MEMBER_ADMIN_ROLE = workspaceRole('role-admin', {
  name: 'Admin',
  canManageMembers: true,
  canManageRoles: true,
});

export const WORKSPACE_ADMIN_ROLE = workspaceRole('role-admin', { name: 'Admin', canManageWorkspace: true });

export const VIEWER_ROLE = workspaceRole('role-viewer', {
  key: 'viewer',
  name: 'Viewer',
  isSystem: true,
  canEditCanvas: false,
  canComment: false,
  canManageStructure: false,
});

export const EDITOR_ROLE = workspaceRole('role-editor', { name: 'Editor', canManageStructure: false });

export const HELPER_ROLE = workspaceRole('role-helper', { name: 'Helper' });

export const COMMENT_ONLY = { canEditCanvas: false, canManageStructure: false };

export const STEWARD_ROLE = workspaceRole('role-steward', {
  ...COMMENT_ONLY,
  name: 'Steward',
  canManageRoles: true,
});

export const MEMBER_STEWARD_ROLE = { ...STEWARD_ROLE, canManageMembers: true };

export const HELD_ROLE = workspaceRole('role-held', { ...COMMENT_ONLY, name: 'Held' });

export const EMPTY_ROLE = workspaceRole('role-empty', { ...COMMENT_ONLY, name: 'Empty', memberCount: 0 });

export const TIERED_ROLES = [OWNER_ROLE, MEMBER_ADMIN_ROLE, MEMBER_MANAGER_ROLE, MEMBER_ROLE, VIEWER_ROLE];

export const CUSTOM_ROLES = [OWNER_ROLE, MEMBER_ROLE, MANAGER_ROLE, HELPER_ROLE, WORKSPACE_ADMIN_ROLE];

export const STEWARD_ROLES = [OWNER_ROLE, MEMBER_ROLE, STEWARD_ROLE, HELD_ROLE, EMPTY_ROLE];

export const SELECTABLE_ROLES = [
  workspaceRole('role-admin', { name: 'Admin' }),
  workspaceRole('role-editor', { name: 'Editor' }),
];

export const MEMBER_MANAGER_ACCESS: IWorkspaceAccess = { ...COMMENT_ACCESS, canManageMembers: true };

export const WORKSPACE_MEMBERS = [
  workspaceMember('u-owner', 'role-owner', { isOwner: true, roleKey: 'owner' }),
  workspaceMember('u-self', 'role-manager'),
  workspaceMember('u-member', 'role-member', { roleKey: 'member' }),
  workspaceMember('u-admin', 'role-admin', { roleName: 'Admin' }),
];

export const PENDING_INVITATIONS = [
  workspaceInvitation('inv-member'),
  { ...workspaceInvitation('inv-admin'), roleId: 'role-admin', roleKey: null, roleName: 'Admin' },
];

export const NAMED_MEMBER = workspaceMember('u-member', 'role-member', { name: 'Mira Holt' });

export const INVITER = { id: 'user-1', email: 'owner@acme.dev' };

export const WORKSPACE_INVITE_REQUEST = { workspaceId: 'ws-1', email: 'teammate@acme.dev', roleId: 'role-1' };

export const INVITE_RPCS = {
  get_workspace_invitations: { data: [] },
  create_workspace_invitation: { data: 'invitation-1' },
};
