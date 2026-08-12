import type { IFolder, IMyInvitation, IThread, IWorkspaceItem, TNavItem } from '@interfaces';

export const SELECTION_ITEMS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];

export const RENAME_ITEMS = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

export const threadItem = (id: string, answered = false): TNavItem => ({
  type: 'thread',
  id,
  name: `Thread ${id}`,
  answered,
});

export const folderItem = (id: string, items: TNavItem[] = []): TNavItem => ({
  type: 'folder',
  id,
  name: `Folder ${id}`,
  items,
});

export const folderInput = (id: string, position: number, parentFolderId: string | null = null): IFolder => ({
  id,
  workspaceId: 'ws-1',
  parentFolderId,
  name: `Folder ${id}`,
  position,
});

export const threadInput = (
  id: string,
  position: number,
  folderId: string | null = null,
  hasAnswer = false,
): IThread => ({
  id,
  workspaceId: 'ws-1',
  folderId,
  name: `Thread ${id}`,
  position,
  hasAnswer,
});

export const workspaceItem = (id: string, canManageWorkspace = true): IWorkspaceItem => ({
  id,
  name: `Workspace ${id}`,
  canManageWorkspace,
});

export const myInvitation = (id: string, workspaceId: string): IMyInvitation => ({
  id,
  workspaceId,
  workspaceName: `Workspace ${workspaceId}`,
  roleKey: 'member',
  roleName: 'Member',
  invitedByName: 'Owner',
  createdAt: '2026-01-01T00:00:00Z',
});
