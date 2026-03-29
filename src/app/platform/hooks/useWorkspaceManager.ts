'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { TNavItem, TNavItemType, IWorkspaceItem } from '@interfaces';
import {
  getWorkspaces,
  createWorkspace,
  renameWorkspace,
  deleteWorkspace,
  deleteWorkspaces,
  moveWorkspace,
  getFolders,
  getThreads,
  createFolder,
  createThread,
  renameFolder,
  renameThread,
  deleteFolder,
  deleteThread,
  deleteFolders,
  deleteThreads,
  moveFolder,
  moveThread,
} from '@api/client';
import { createClient } from '@/lib/supabase/client';
import {
  buildNavTree,
  containsThread,
  findInTree,
  findParentId,
  getSiblings,
  insertIntoTree,
  removeFromTree,
  updateNavItemName,
} from '@/components/Sidebar/utils';

export const useWorkspaceManager = () => {
  const router = useRouter();
  const params = useParams();
  const workspaceIdParam = params.workspaceId as string | undefined;
  const threadIdParam = params.threadId as string | undefined;

  const [workspaces, setWorkspaces] = useState<IWorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null
  );
  const [navItems, setNavItems] = useState<TNavItem[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    threadIdParam
  );
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(
    null
  );

  const initialized = useRef(false);

  useEffect(() => {
    setActiveThreadId(threadIdParam);
  }, [threadIdParam]);

  const loadWorkspaceContent = useCallback(async (workspaceId: string) => {
    const [folders, threads] = await Promise.all([
      getFolders(workspaceId),
      getThreads(workspaceId),
    ]);
    setNavItems(buildNavTree(folders, threads));
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const [, workspaceList] = await Promise.all([
        createClient().auth.getSession(),
        getWorkspaces(),
      ]);
      setWorkspaces(
        workspaceList.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
        }))
      );

      const targetWorkspaceId = workspaceIdParam
        ? workspaceList.find((workspace) => workspace.id === workspaceIdParam)
            ?.id
        : undefined;

      if (targetWorkspaceId) {
        setActiveWorkspaceId(targetWorkspaceId);
        await loadWorkspaceContent(targetWorkspaceId);
      }

      setLoading(false);
    };

    init().catch(() => setLoading(false));
  }, [workspaceIdParam, loadWorkspaceContent]);

  const handleWorkspaceSelect = useCallback(
    async (id: string) => {
      setActiveWorkspaceId(id);
      setEditingItemId(null);
      setEditingWorkspaceId(null);
      setLoading(true);
      await loadWorkspaceContent(id);
      setLoading(false);
      router.push(`/platform`);
    },
    [router, loadWorkspaceContent]
  );

  const handleCreateWorkspace = useCallback(async () => {
    const created = await createWorkspace('New Workspace');
    if (!created) return;

    const newWorkspace: IWorkspaceItem = {
      id: created.id,
      name: created.name,
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(created.id);
    setEditingWorkspaceId(created.id);
    setNavItems([]);
    router.push(`/platform`);
  }, [router]);

  const reloadWorkspaces = useCallback(async () => {
    const workspaceList = await getWorkspaces();
    setWorkspaces(
      workspaceList.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
      }))
    );
  }, []);

  const handleRenameWorkspace = useCallback(
    async (id: string, name: string) => {
      setWorkspaces((prev) =>
        prev.map((workspace) =>
          workspace.id === id ? { ...workspace, name } : workspace
        )
      );
      try {
        await renameWorkspace(id, name);
      } catch {
        await reloadWorkspaces();
      }
    },
    [reloadWorkspaces]
  );

  const handleDeleteWorkspace = useCallback(
    async (id: string) => {
      try {
        await deleteWorkspace(id);
      } catch {
        return;
      }

      setWorkspaces((prev) => {
        const remaining = prev.filter((workspace) => workspace.id !== id);
        if (activeWorkspaceId === id) {
          const next = remaining[0];
          if (next) {
            setActiveWorkspaceId(next.id);
            loadWorkspaceContent(next.id);
          } else {
            setActiveWorkspaceId(null);
            setNavItems([]);
          }
        }
        return remaining;
      });

      router.push('/platform');
    },
    [activeWorkspaceId, router, loadWorkspaceContent]
  );

  const handleCreateThread = useCallback(
    async (folderId?: string) => {
      if (!activeWorkspaceId) return;

      const thread = await createThread(activeWorkspaceId, folderId);
      if (!thread) return;

      const newItem: TNavItem = {
        type: 'thread',
        id: thread.id,
        name: thread.name,
      };
      setNavItems((prev) =>
        folderId
          ? insertIntoTree(prev, newItem, folderId, Infinity)
          : [...prev, newItem]
      );
      setEditingItemId(thread.id);
      router.push(`/platform/${activeWorkspaceId}/${thread.id}`);
    },
    [activeWorkspaceId, router]
  );

  const handleCreateFolder = useCallback(async () => {
    if (!activeWorkspaceId) return;

    const folder = await createFolder(activeWorkspaceId);
    if (!folder) return;

    setNavItems((prev) => [
      ...prev,
      { type: 'folder', id: folder.id, name: folder.name, items: [] },
    ]);
    setEditingItemId(folder.id);
  }, [activeWorkspaceId]);

  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!activeWorkspaceId) return;

      const item = findInTree(navItems, id);
      if (!item) return;

      try {
        if (item.type === 'folder') {
          await deleteFolder(id);
        } else {
          await deleteThread(id);
        }
      } catch {
        return;
      }

      setNavItems((prev) => removeFromTree(prev, id));

      const shouldNavigate =
        item.type === 'thread'
          ? threadIdParam === id
          : threadIdParam && containsThread(item, threadIdParam);
      if (shouldNavigate) {
        router.push(`/platform`);
      }
    },
    [activeWorkspaceId, navItems, threadIdParam, router]
  );

  const handleRenameItem = useCallback(
    async (id: string, name: string) => {
      const item = findInTree(navItems, id);
      if (!item) return;

      setNavItems((prev) => updateNavItemName(prev, id, name));

      try {
        if (item.type === 'folder') {
          await renameFolder(id, name);
        } else {
          await renameThread(id, name);
        }
      } catch {
        if (activeWorkspaceId) await loadWorkspaceContent(activeWorkspaceId);
      }
    },
    [navItems, activeWorkspaceId, loadWorkspaceContent]
  );

  const handleMoveItem = useCallback(
    async (
      id: string,
      type: TNavItemType,
      parentId: string | null,
      position: number
    ) => {
      if (!activeWorkspaceId) return;

      const oldParentId = findParentId(navItems, id) ?? null;

      const targetSiblings = getSiblings(navItems, parentId);
      const siblingEntries = targetSiblings.map((sibling, index) => ({
        id: sibling.id,
        type: sibling.type,
        oldPos: index,
      }));
      const draggedOldPos =
        siblingEntries.find((sibling) => sibling.id === id)?.oldPos ?? -1;

      setNavItems((prev) => {
        const item = findInTree(prev, id);
        if (!item) return prev;
        const without = removeFromTree(prev, id);
        return insertIntoTree(without, item, parentId, position);
      });

      const withoutDragged = siblingEntries.filter(
        (sibling) => sibling.id !== id
      );
      withoutDragged.splice(position, 0, { id, type, oldPos: draggedOldPos });

      const newParentUpdates = withoutDragged
        .map((sibling, index) => ({
          ...sibling,
          newPos: index,
          targetParentId: parentId,
        }))
        .filter((update) => update.oldPos !== update.newPos);

      const allUpdates = [...newParentUpdates];

      if (oldParentId !== parentId) {
        const oldSiblings = getSiblings(navItems, oldParentId);
        const removedIndex = oldSiblings.findIndex(
          (sibling) => sibling.id === id
        );
        if (removedIndex !== -1) {
          const compactUpdates = oldSiblings
            .slice(removedIndex + 1)
            .map((sibling, index) => ({
              id: sibling.id,
              type: sibling.type,
              oldPos: -1,
              newPos: removedIndex + index,
              targetParentId: oldParentId,
            }));
          allUpdates.push(...compactUpdates);
        }
      }

      try {
        await Promise.all(
          allUpdates.map((update) =>
            update.type === 'folder'
              ? moveFolder(update.id, update.targetParentId, update.newPos)
              : moveThread(update.id, update.targetParentId, update.newPos)
          )
        );
      } catch {
        if (activeWorkspaceId) await loadWorkspaceContent(activeWorkspaceId);
      }
    },
    [activeWorkspaceId, navItems, loadWorkspaceContent]
  );

  const handleBulkDelete = useCallback(
    async (ids: Set<string>) => {
      if (!activeWorkspaceId) return;

      const resolved = [...ids]
        .map((id) => findInTree(navItems, id))
        .filter((item): item is TNavItem => item !== null);
      const folderIds = resolved
        .filter((item) => item.type === 'folder')
        .map((item) => item.id);
      const threadIds = resolved
        .filter((item) => item.type === 'thread')
        .map((item) => item.id);

      setNavItems((prev) =>
        [...ids].reduce((acc, id) => removeFromTree(acc, id), prev)
      );

      const promises: Promise<unknown>[] = [];
      if (folderIds.length > 0) promises.push(deleteFolders(folderIds));
      if (threadIds.length > 0) promises.push(deleteThreads(threadIds));
      try {
        await Promise.all(promises);
      } catch {
        if (activeWorkspaceId) await loadWorkspaceContent(activeWorkspaceId);
        return;
      }

      const shouldNavigate =
        !!threadIdParam &&
        (ids.has(threadIdParam) ||
          folderIds.some((folderId) => {
            const folder = findInTree(navItems, folderId);
            return !!folder && containsThread(folder, threadIdParam);
          }));
      if (shouldNavigate) {
        router.push('/platform');
      }
    },
    [activeWorkspaceId, navItems, threadIdParam, router, loadWorkspaceContent]
  );

  const handleBulkDeleteWorkspaces = useCallback(
    async (ids: Set<string>) => {
      const idArr = [...ids];

      setWorkspaces((prev) => {
        const remaining = prev.filter((workspace) => !ids.has(workspace.id));
        if (activeWorkspaceId && ids.has(activeWorkspaceId)) {
          const next = remaining[0];
          if (next) {
            setActiveWorkspaceId(next.id);
            loadWorkspaceContent(next.id);
          } else {
            setActiveWorkspaceId(null);
            setNavItems([]);
          }
          router.push('/platform');
        }
        return remaining;
      });

      try {
        await deleteWorkspaces(idArr);
      } catch {
        await reloadWorkspaces();
      }
    },
    [activeWorkspaceId, router, loadWorkspaceContent, reloadWorkspaces]
  );

  const handleMoveWorkspace = useCallback(
    async (id: string, position: number) => {
      const oldIndex = workspaces.findIndex((workspace) => workspace.id === id);
      if (oldIndex === -1 || oldIndex === position) return;

      const reordered = [...workspaces];
      const [moved] = reordered.splice(oldIndex, 1);
      if (!moved) return;
      reordered.splice(position, 0, moved);

      setWorkspaces(reordered);

      const from = Math.min(oldIndex, position);
      const to = Math.max(oldIndex, position);
      const updates = reordered.slice(from, to + 1).map((workspace, index) => ({
        id: workspace.id,
        position: from + index,
      }));

      try {
        await Promise.all(
          updates.map((update) => moveWorkspace(update.id, update.position))
        );
      } catch {
        await reloadWorkspaces();
      }
    },
    [workspaces, reloadWorkspaces]
  );

  const handleBulkMove = useCallback(
    async (ids: Set<string>, targetParentId: string | null) => {
      if (!activeWorkspaceId) return;

      const targetSiblings = getSiblings(navItems, targetParentId);
      const existingCount = targetSiblings.filter(
        (sibling) => !ids.has(sibling.id)
      ).length;

      const itemsToMove = [...ids]
        .map((id) => findInTree(navItems, id))
        .filter((item): item is TNavItem => item !== null)
        .map((item) => ({ item, type: item.type }));

      setNavItems((prev) => {
        const removed = [...ids].reduce(
          (acc, id) => removeFromTree(acc, id),
          prev
        );
        return itemsToMove.reduce(
          (acc, { item }, index) =>
            insertIntoTree(acc, item, targetParentId, existingCount + index),
          removed
        );
      });

      const promises = itemsToMove.map(({ item, type }, index) =>
        type === 'folder'
          ? moveFolder(item.id, targetParentId, existingCount + index)
          : moveThread(item.id, targetParentId, existingCount + index)
      );
      try {
        await Promise.all(promises);
      } catch {
        if (activeWorkspaceId) await loadWorkspaceContent(activeWorkspaceId);
      }
    },
    [activeWorkspaceId, navItems, loadWorkspaceContent]
  );

  const handleItemClick = useCallback(
    (id: string) => {
      const item = findInTree(navItems, id);
      if (item?.type === 'thread' && activeWorkspaceId) {
        setActiveThreadId(id);
        router.push(`/platform/${activeWorkspaceId}/${id}`);
      }
    },
    [navItems, activeWorkspaceId, router]
  );

  return {
    workspaces,
    activeWorkspaceId,
    navItems,
    activeThreadId,
    editingItemId,
    clearEditingItemId: useCallback(() => setEditingItemId(null), []),
    editingWorkspaceId,
    clearEditingWorkspaceId: useCallback(() => setEditingWorkspaceId(null), []),
    loading,
    onWorkspaceSelect: handleWorkspaceSelect,
    onCreateWorkspace: handleCreateWorkspace,
    onRenameWorkspace: handleRenameWorkspace,
    onDeleteWorkspace: handleDeleteWorkspace,
    onMoveWorkspace: handleMoveWorkspace,
    onCreateThread: handleCreateThread,
    onCreateFolder: handleCreateFolder,
    onDeleteItem: handleDeleteItem,
    onRenameItem: handleRenameItem,
    onItemClick: handleItemClick,
    onMoveItem: handleMoveItem,
    onBulkDelete: handleBulkDelete,
    onBulkMove: handleBulkMove,
    onBulkDeleteWorkspaces: handleBulkDeleteWorkspaces,
  };
};
