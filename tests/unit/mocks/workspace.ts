import type { IWorkspace } from '@interfaces';

export const WORKSPACE: IWorkspace = {
  id: 'ws-1',
  name: 'Product Lab',
  ownerId: 'user-1',
  createdAt: '2026-03-15T12:00:00Z',
};

export const SHARED_WORKSPACES = [
  { id: 'ws-1', name: 'Alpha lab' },
  { id: 'ws-2', name: 'Beta guild' },
];
