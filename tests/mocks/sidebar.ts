import type { IFolder, IThread, TNavItem } from '@interfaces';

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
