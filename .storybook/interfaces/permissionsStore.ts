export interface IMockPermissionsState {
  userId?: string | null;
  workspaceId?: string | null;
  isOwner?: boolean;
  canEditCanvas?: boolean;
  canComment?: boolean;
  canManageStructure?: boolean;
  canManageMembers?: boolean;
  canManageRoles?: boolean;
  canManageWorkspace?: boolean;
}
