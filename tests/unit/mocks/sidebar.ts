import { vi } from 'vitest';

import type { IFolder, IInlineEdit, IMyInvitation, IThread, IWorkspaceItem, TNavItem } from '@interfaces';

import { TRANSLATIONS } from '@mocks/i18n';
import { flattenTree } from '@/components/Sidebar/utils';

export const SELECTION_ITEMS = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }];

export const RENAME_ITEMS = [
  { id: '1', name: 'Alpha' },
  { id: '2', name: 'Beta' },
];

export const threadItem = (id: string, resolved = false): TNavItem => ({
  type: 'thread',
  id,
  name: `Thread ${id}`,
  resolved,
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
  resolved = false,
): IThread => ({
  id,
  workspaceId: 'ws-1',
  folderId,
  name: `Thread ${id}`,
  position,
  resolved,
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

export const inlineEdit = (overrides: Partial<IInlineEdit> = {}): IInlineEdit => ({
  editingId: null,
  editValue: '',
  setEditValue: vi.fn(),
  inputRef: vi.fn(),
  startEditing: vi.fn(),
  commitRename: vi.fn(),
  cancelEditing: vi.fn(),
  handleKeyDown: vi.fn(),
  ...overrides,
});

export const INITIAL_TREE: TNavItem[] = [threadItem('t1'), folderItem('f1', [threadItem('t2')])];

export const NESTED_FOLDER_TREE = [
  folderItem('f1', [folderItem('f2', [threadItem('t1')])]),
  folderItem('f3'),
  threadItem('t2'),
];

export const MIXED_TREE = [folderItem('f1', [threadItem('t1')]), folderItem('f2'), threadItem('t2')];

export const BRANCHING_TREE = [
  folderItem('f1', [folderItem('f2', [threadItem('t1')]), threadItem('t2')]),
  threadItem('t3'),
];

export const FOLDER_THREADS_TREE: TNavItem[] = [
  folderItem('f1', [threadItem('t1'), threadItem('t2')]),
  threadItem('t3'),
  threadItem('t4'),
];

export const BULK_TREE: TNavItem[] = [
  folderItem('f1', [threadItem('t1')]),
  folderItem('f2', [threadItem('t2')]),
  threadItem('t3'),
];

export const DEEP_TREE: TNavItem[] = [
  folderItem('f1', [threadItem('t1')]),
  folderItem('fD', [folderItem('fE')]),
  threadItem('t3'),
  threadItem('t4'),
];

export const DEEP_LAST_TREE: TNavItem[] = [folderItem('fD', [folderItem('fE')]), folderItem('f1', [threadItem('t1')])];

export const FLAT_TREE: TNavItem[] = [
  threadItem('t1'),
  threadItem('t2'),
  threadItem('t3'),
  threadItem('t4'),
  threadItem('t5'),
];

export const BULK_SELECTED = new Set(['f1', 'f2']);
export const SIDE_SELECTED = new Set(['t2', 't3']);
export const SPREAD_SELECTED = new Set(['t2', 't4']);

export const MIXED_ROWS = flattenTree(
  [folderItem('f1', [threadItem('t1')]), folderItem('f2'), threadItem('t2', true)],
  new Set(),
);

export const BRANCHING_ROWS = flattenTree(BRANCHING_TREE, new Set());

export const MOVE_TARGET_NAMES = [TRANSLATIONS.platform.sidebar.rootLevel, 'Folder f1', 'Folder f2', 'Folder f3'];

export const BASE_WORKSPACES = [workspaceItem('ws-1')];

export const PLAIN_CLICK = { shiftKey: false, ctrlKey: false, metaKey: false };
export const CTRL_CLICK = { ...PLAIN_CLICK, ctrlKey: true };
export const META_CLICK = { ...PLAIN_CLICK, metaKey: true };
export const SHIFT_CLICK = { ...PLAIN_CLICK, shiftKey: true };
