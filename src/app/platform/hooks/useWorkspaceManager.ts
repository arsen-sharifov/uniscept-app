'use client';

import type { Node } from '@xyflow/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

import {
  ECanvasNodeType,
  type ICanvasNodeData,
  type TNavItem,
  type TNavItemType,
  type IWorkspaceItem,
} from '@interfaces';
import {
  getWorkspaces,
  createWorkspace,
  updateWorkspaceName,
  deleteWorkspace,
  deleteWorkspaces,
  moveWorkspace,
  getFolders,
  getThreads,
  createFolder,
  createThread,
  updateFolderName,
  updateThreadName,
  deleteFolder,
  deleteThread,
  deleteFolders,
  deleteThreads,
  moveFolder,
  moveThread,
} from '@api/client';
import {
  buildNavTree,
  containsThread,
  findFirstThread,
  findInTree,
  findParentId,
  getSiblings,
  insertIntoTree,
  removeFromTree,
  setThreadAnswered,
  updateNavItemName,
} from '@/components/Sidebar/utils';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { useCanvasStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';

export const useWorkspaceManager = () => {
  const router = useRouter();
  const params = useParams();
  const workspaceIdParam = params.workspaceId as string | undefined;
  const threadIdParam = params.threadId as string | undefined;
  const t = useTranslations();

  const [workspaces, setWorkspaces] = useState<IWorkspaceItem[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [navItems, setNavItems] = useState<TNavItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);

  const initialized = useRef(false);
  const justCreatedIds = useRef<Set<string>>(new Set());

  const loadWorkspaceContent = useCallback(async (workspaceId: string): Promise<TNavItem[]> => {
    const [folders, threads] = await Promise.all([getFolders(workspaceId), getThreads(workspaceId)]);
    const tree = buildNavTree(folders, threads);
    setNavItems(tree);

    return tree;
  }, []);

  const reloadWorkspaceContent = useCallback(
    (workspaceId: string) =>
      loadWorkspaceContent(workspaceId).catch((error: unknown) => {
        event.error(error, { toast: false, context: 'sidebar.reloadContent' });
      }),
    [loadWorkspaceContent],
  );

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const [, workspaceList] = await Promise.all([createClient().auth.getSession(), getWorkspaces()]);
      setWorkspaces(
        workspaceList.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
        })),
      );

      const targetWorkspaceId = workspaceIdParam
        ? workspaceList.find((workspace) => workspace.id === workspaceIdParam)?.id
        : workspaceList[0]?.id;

      if (targetWorkspaceId) {
        setActiveWorkspaceId(targetWorkspaceId);
        const tree = await loadWorkspaceContent(targetWorkspaceId);

        if (!threadIdParam) {
          const firstThreadId = findFirstThread(tree);
          if (firstThreadId) router.replace(`/platform/${targetWorkspaceId}/${firstThreadId}`);
        }
      }

      setLoading(false);
    };

    init().catch((error) => {
      event.error(error, { context: 'sidebar.loadWorkspaces' });
      setLoading(false);
    });
  }, [workspaceIdParam, threadIdParam, loadWorkspaceContent, router]);

  useEffect(() => {
    const hasAnswerOf = (nodes: Node[]) =>
      nodes.some((node) => node.type === ECanvasNodeType.Canvas && (node.data as ICanvasNodeData).isAnswer);

    let lastThreadId = useCanvasStore.getState().threadId;
    let lastHasAnswer = hasAnswerOf(useCanvasStore.getState().nodes);

    return useCanvasStore.subscribe((state) => {
      const { threadId, nodes } = state;
      if (!threadId) return;

      const hasAnswer = hasAnswerOf(nodes);
      if (threadId === lastThreadId && hasAnswer === lastHasAnswer) return;

      lastThreadId = threadId;
      lastHasAnswer = hasAnswer;
      setNavItems((prev) => setThreadAnswered(prev, threadId, hasAnswer));
    });
  }, []);

  const handleWorkspaceSelect = useCallback(
    async (id: string) => {
      const previousWorkspaceId = activeWorkspaceId;
      setActiveWorkspaceId(id);
      setEditingItemId(null);
      setEditingWorkspaceId(null);
      setLoading(true);
      const tree = await loadWorkspaceContent(id).catch((error: unknown) => {
        event.error(error, { title: t.common.errorTitles.loadFailed, context: 'sidebar.selectWorkspace' });
        setActiveWorkspaceId(previousWorkspaceId);

        return null;
      });
      setLoading(false);
      if (!tree) return;

      const firstThreadId = findFirstThread(tree);
      router.push(firstThreadId ? `/platform/${id}/${firstThreadId}` : '/platform');
    },
    [activeWorkspaceId, router, loadWorkspaceContent, t],
  );

  const handleCreateWorkspace = useCallback(async () => {
    const created = await createWorkspace('New Workspace').catch((error: unknown) => {
      event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createWorkspace' });

      return null;
    });
    if (!created) return;

    const newWorkspace: IWorkspaceItem = {
      id: created.id,
      name: created.name,
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setActiveWorkspaceId(created.id);
    setEditingWorkspaceId(created.id);
    justCreatedIds.current.add(created.id);
    setNavItems([]);
    router.push(`/platform`);
    event.success(t.platform.sidebar.workspaceCreated);
  }, [router, t]);

  const reloadWorkspaces = useCallback(async () => {
    const workspaceList = await getWorkspaces().catch((error: unknown) => {
      event.error(error, { toast: false, context: 'sidebar.reloadWorkspaces' });

      return null;
    });
    if (!workspaceList) return;

    setWorkspaces(
      workspaceList.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
      })),
    );
  }, []);

  const handleRenameWorkspace = useCallback(
    async (id: string, name: string) => {
      const wasJustCreated = justCreatedIds.current.delete(id);
      setWorkspaces((prev) => prev.map((workspace) => (workspace.id === id ? { ...workspace, name } : workspace)));
      try {
        await updateWorkspaceName(id, name);
        if (!wasJustCreated) event.success(t.platform.sidebar.workspaceRenamed);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.renameFailed, context: 'sidebar.renameWorkspace' });
        await reloadWorkspaces();
      }
    },
    [reloadWorkspaces, t],
  );

  const handleDeleteWorkspace = useCallback(
    async (id: string) => {
      try {
        await deleteWorkspace(id);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.deleteWorkspace' });

        return;
      }

      setWorkspaces((prev) => {
        const remaining = prev.filter((workspace) => workspace.id !== id);
        if (activeWorkspaceId === id) {
          const next = remaining[0];
          if (next) {
            setActiveWorkspaceId(next.id);
            reloadWorkspaceContent(next.id);
          } else {
            setActiveWorkspaceId(null);
            setNavItems([]);
          }
        }

        return remaining;
      });

      router.push('/platform');
      event.success(t.platform.sidebar.workspaceDeleted);
    },
    [activeWorkspaceId, router, reloadWorkspaceContent, t],
  );

  const handleCreateThread = useCallback(
    async (folderId?: string) => {
      if (!activeWorkspaceId) return;

      const thread = await createThread(activeWorkspaceId, folderId).catch((error: unknown) => {
        event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createThread' });

        return null;
      });
      if (!thread) return;

      const newItem: TNavItem = {
        type: 'thread',
        id: thread.id,
        name: thread.name,
      };
      setNavItems((prev) => (folderId ? insertIntoTree(prev, newItem, folderId, Infinity) : [...prev, newItem]));
      setEditingItemId(thread.id);
      justCreatedIds.current.add(thread.id);
      router.push(`/platform/${activeWorkspaceId}/${thread.id}`);
      event.success(t.platform.sidebar.threadCreated);
    },
    [activeWorkspaceId, router, t],
  );

  const handleCreateFolder = useCallback(async () => {
    if (!activeWorkspaceId) return;

    const folder = await createFolder(activeWorkspaceId).catch((error: unknown) => {
      event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createFolder' });

      return null;
    });
    if (!folder) return;

    setNavItems((prev) => [...prev, { type: 'folder', id: folder.id, name: folder.name, items: [] }]);
    setEditingItemId(folder.id);
    justCreatedIds.current.add(folder.id);
    event.success(t.platform.sidebar.folderCreated);
  }, [activeWorkspaceId, t]);

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
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.deleteItem' });

        return;
      }

      setNavItems((prev) => removeFromTree(prev, id));
      event.success(item.type === 'folder' ? t.platform.sidebar.folderDeleted : t.platform.sidebar.threadDeleted);

      const shouldNavigate =
        item.type === 'thread' ? threadIdParam === id : threadIdParam && containsThread(item, threadIdParam);
      if (shouldNavigate) {
        router.push(`/platform`);
      }
    },
    [activeWorkspaceId, navItems, threadIdParam, router, t],
  );

  const handleRenameItem = useCallback(
    async (id: string, name: string) => {
      const item = findInTree(navItems, id);
      if (!item) return;

      const wasJustCreated = justCreatedIds.current.delete(id);
      setNavItems((prev) => updateNavItemName(prev, id, name));

      try {
        if (item.type === 'folder') {
          await updateFolderName(id, name);
        } else {
          await updateThreadName(id, name);
        }
        if (!wasJustCreated) {
          event.success(item.type === 'folder' ? t.platform.sidebar.folderRenamed : t.platform.sidebar.threadRenamed);
        }
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.renameFailed, context: 'sidebar.renameItem' });
        if (activeWorkspaceId) await reloadWorkspaceContent(activeWorkspaceId);
      }
    },
    [navItems, activeWorkspaceId, reloadWorkspaceContent, t],
  );

  const handleMoveItem = useCallback(
    async (id: string, type: TNavItemType, parentId: string | null, position: number) => {
      if (!activeWorkspaceId) return;

      const oldParentId = findParentId(navItems, id) ?? null;

      const targetSiblings = getSiblings(navItems, parentId);
      const siblingEntries = targetSiblings.map((sibling, index) => ({
        id: sibling.id,
        type: sibling.type,
        oldPos: index,
      }));
      const draggedOldPos = siblingEntries.find((sibling) => sibling.id === id)?.oldPos ?? -1;

      setNavItems((prev) => {
        const item = findInTree(prev, id);
        if (!item) return prev;
        const without = removeFromTree(prev, id);

        return insertIntoTree(without, item, parentId, position);
      });

      const withoutDragged = siblingEntries.filter((sibling) => sibling.id !== id);
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
        const removedIndex = oldSiblings.findIndex((sibling) => sibling.id === id);
        if (removedIndex !== -1) {
          const compactUpdates = oldSiblings.slice(removedIndex + 1).map((sibling, index) => ({
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
              : moveThread(update.id, update.targetParentId, update.newPos),
          ),
        );
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.moveFailed, context: 'sidebar.moveItem' });
        if (activeWorkspaceId) await reloadWorkspaceContent(activeWorkspaceId);
      }
    },
    [activeWorkspaceId, navItems, reloadWorkspaceContent, t],
  );

  const handleBulkDelete = useCallback(
    async (ids: Set<string>) => {
      if (!activeWorkspaceId) return;

      const resolved = [...ids].map((id) => findInTree(navItems, id)).filter((item): item is TNavItem => item !== null);
      const folderIds = resolved.filter((item) => item.type === 'folder').map((item) => item.id);
      const threadIds = resolved.filter((item) => item.type === 'thread').map((item) => item.id);

      setNavItems((prev) => [...ids].reduce((acc, id) => removeFromTree(acc, id), prev));

      const promises: Promise<unknown>[] = [];
      if (folderIds.length > 0) promises.push(deleteFolders(folderIds));
      if (threadIds.length > 0) promises.push(deleteThreads(threadIds));
      try {
        await Promise.all(promises);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.bulkDelete' });

        if (activeWorkspaceId) {
          await reloadWorkspaceContent(activeWorkspaceId);
        }

        return;
      }

      event.success(t.platform.sidebar.itemsDeleted);

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
    [activeWorkspaceId, navItems, threadIdParam, router, reloadWorkspaceContent, t],
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
            reloadWorkspaceContent(next.id);
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
        event.success(t.platform.sidebar.workspacesDeleted);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.bulkDeleteWorkspaces' });
        await reloadWorkspaces();
      }
    },
    [activeWorkspaceId, router, reloadWorkspaceContent, reloadWorkspaces, t],
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
        await Promise.all(updates.map((update) => moveWorkspace(update.id, update.position)));
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.moveFailed, context: 'sidebar.moveWorkspace' });
        await reloadWorkspaces();
      }
    },
    [workspaces, reloadWorkspaces, t],
  );

  const handleBulkMove = useCallback(
    async (ids: Set<string>, targetParentId: string | null) => {
      if (!activeWorkspaceId) return;

      const targetSiblings = getSiblings(navItems, targetParentId);
      const existingCount = targetSiblings.filter((sibling) => !ids.has(sibling.id)).length;

      const itemsToMove = [...ids]
        .map((id) => findInTree(navItems, id))
        .filter((item): item is TNavItem => item !== null)
        .map((item) => ({ item, type: item.type }));

      setNavItems((prev) => {
        const removed = [...ids].reduce((acc, id) => removeFromTree(acc, id), prev);

        return itemsToMove.reduce(
          (acc, { item }, index) => insertIntoTree(acc, item, targetParentId, existingCount + index),
          removed,
        );
      });

      const promises = itemsToMove.map(({ item, type }, index) =>
        type === 'folder'
          ? moveFolder(item.id, targetParentId, existingCount + index)
          : moveThread(item.id, targetParentId, existingCount + index),
      );
      try {
        await Promise.all(promises);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.moveFailed, context: 'sidebar.bulkMove' });
        if (activeWorkspaceId) await reloadWorkspaceContent(activeWorkspaceId);
      }
    },
    [activeWorkspaceId, navItems, reloadWorkspaceContent, t],
  );

  const handleItemClick = useCallback(
    (id: string) => {
      const item = findInTree(navItems, id);
      if (item?.type === 'thread' && activeWorkspaceId) {
        router.push(`/platform/${activeWorkspaceId}/${id}`);
      }
    },
    [navItems, activeWorkspaceId, router],
  );

  return {
    workspaces,
    activeWorkspaceId,
    navItems,
    activeThreadId: threadIdParam,
    editingItemId,
    clearEditingItemId: useCallback(() => {
      justCreatedIds.current.clear();
      setEditingItemId(null);
    }, []),
    editingWorkspaceId,
    clearEditingWorkspaceId: useCallback(() => {
      justCreatedIds.current.clear();
      setEditingWorkspaceId(null);
    }, []),
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
