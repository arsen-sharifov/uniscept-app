import { useState } from 'react';
import type { IWorkspaceItem, TNavItem } from '@interfaces';
import {
  type ISidebarProps,
  Sidebar,
  findInTree,
  insertIntoTree,
  removeFromTree,
  updateNavItemName,
} from '@/components';

const nextId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export const SidebarWithState = (args: ISidebarProps) => {
  const [activeItemId, setActiveItemId] = useState(args.activeItemId);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(args.activeWorkspaceId);
  const [items, setItems] = useState<TNavItem[]>(args.items ?? []);
  const [wsItems, setWsItems] = useState<IWorkspaceItem[]>(args.workspaces ?? []);
  const [editingItemId, setEditingItemId] = useState<string | null>(args.editingItemId ?? null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(args.editingWorkspaceId ?? null);

  const handleItemClick = (id: string) => {
    args.onItemClick?.(id);
    setActiveItemId(id);
  };

  const handleWorkspaceSelect = (id: string) => {
    args.onWorkspaceSelect?.(id);
    setActiveWorkspaceId(id);
    setEditingItemId(null);
  };

  const handleCreateThread = (folderId?: string) => {
    args.onCreateThread?.(folderId);
    const id = nextId('thread');
    const thread: TNavItem = { type: 'thread', id, name: 'New Thread' };
    if (folderId) {
      setItems((prev) => insertIntoTree(prev, thread, folderId, Infinity));
    } else {
      setItems((prev) => [...prev, thread]);
    }
    setEditingItemId(id);
  };

  const handleCreateFolder = () => {
    args.onCreateFolder?.();
    const id = nextId('folder');
    setItems((prev) => [...prev, { type: 'folder', id, name: 'New Folder', items: [] }]);
    setEditingItemId(id);
  };

  const handleRenameItem: NonNullable<ISidebarProps['onRenameItem']> = (id, name) => {
    args.onRenameItem?.(id, name);
    setItems((prev) => updateNavItemName(prev, id, name));
  };

  const handleDeleteItem = (id: string) => {
    args.onDeleteItem?.(id);
    setItems((prev) => removeFromTree(prev, id));
  };

  const handleBulkDelete = (ids: Set<string>) => {
    args.onBulkDelete?.(ids);
    setItems((prev) => [...ids].reduce((acc, id) => removeFromTree(acc, id), prev));
  };

  const handleBulkDeleteWorkspaces = (ids: Set<string>) => {
    args.onBulkDeleteWorkspaces?.(ids);
    setWsItems((prev) => {
      const remaining = prev.filter((w) => !ids.has(w.id));
      if (activeWorkspaceId && ids.has(activeWorkspaceId)) {
        setActiveWorkspaceId(remaining[0]?.id);
      }
      return remaining;
    });
  };

  const handleBulkMove = (ids: Set<string>, parentId: string | null, position: number) => {
    args.onBulkMove?.(ids, parentId, position);
    setItems((prev) => {
      const toMove = [...ids].map((id) => findInTree(prev, id)).filter((item): item is TNavItem => item !== null);
      const removed = [...ids].reduce((acc, id) => removeFromTree(acc, id), prev);
      return toMove.reduce((acc, item, index) => insertIntoTree(acc, item, parentId, position + index), removed);
    });
  };

  const handleMoveItem: NonNullable<ISidebarProps['onMoveItem']> = (id, type, parentId, position) => {
    args.onMoveItem?.(id, type, parentId, position);
    setItems((prev) => {
      const item = findInTree(prev, id);
      if (!item) return prev;
      const without = removeFromTree(prev, id);
      return insertIntoTree(without, item, parentId, position);
    });
  };

  const handleCreateWorkspace = () => {
    args.onCreateWorkspace?.();
    const id = nextId('ws');
    setWsItems((prev) => [...prev, { id, name: 'New Workspace' }]);
    setActiveWorkspaceId(id);
    setEditingWorkspaceId(id);
  };

  const handleRenameWorkspace: NonNullable<ISidebarProps['onRenameWorkspace']> = (id, name) => {
    args.onRenameWorkspace?.(id, name);
    setWsItems((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w)));
  };

  const handleDeleteWorkspace = (id: string) => {
    args.onDeleteWorkspace?.(id);
    setWsItems((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      if (id === activeWorkspaceId && remaining.length > 0) {
        setActiveWorkspaceId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleEditingComplete = () => {
    args.onEditingComplete?.();
    setEditingItemId(null);
  };

  const handleWorkspaceEditingComplete = () => {
    args.onWorkspaceEditingComplete?.();
    setEditingWorkspaceId(null);
  };

  return (
    <Sidebar
      {...args}
      items={items}
      workspaces={wsItems}
      activeItemId={activeItemId}
      activeWorkspaceId={activeWorkspaceId}
      editingItemId={editingItemId}
      editingWorkspaceId={editingWorkspaceId}
      onItemClick={handleItemClick}
      onWorkspaceSelect={handleWorkspaceSelect}
      onCreateThread={handleCreateThread}
      onCreateFolder={handleCreateFolder}
      onRenameItem={handleRenameItem}
      onDeleteItem={handleDeleteItem}
      onBulkDelete={handleBulkDelete}
      onBulkDeleteWorkspaces={handleBulkDeleteWorkspaces}
      onBulkMove={handleBulkMove}
      onMoveItem={handleMoveItem}
      onCreateWorkspace={handleCreateWorkspace}
      onRenameWorkspace={handleRenameWorkspace}
      onDeleteWorkspace={handleDeleteWorkspace}
      onMoveWorkspace={args.onMoveWorkspace}
      onEditingComplete={handleEditingComplete}
      onWorkspaceEditingComplete={handleWorkspaceEditingComplete}
    />
  );
};
