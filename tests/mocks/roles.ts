import type { IWorkspaceAccess } from '@interfaces';

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
