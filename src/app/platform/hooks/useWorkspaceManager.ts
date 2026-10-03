'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

import type { IMyInvitation, IWorkspaceItem, TNavItem, TNavItemType } from '@interfaces';
import {
  getMyWorkspaces,
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
  getMyInvitations,
  acceptWorkspaceInvitation,
  declineWorkspaceInvitation,
} from '@api/client';
import {
  buildNavTree,
  containsThread,
  findFirstThread,
  findInTree,
  findOutermostItems,
  findParentId,
  getSiblings,
  insertIntoTree,
  removeFromTree,
  setThreadResolved,
  updateNavItemName,
} from '@/components/Sidebar';
import { useTranslations } from '@/i18n';
import { awardBadge } from '@/lib/badges';
import { isThreadResolved } from '@/lib/canvas';
import { event } from '@/lib/events';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';
import { createClient } from '@/lib/supabase';

import { useWorkspaceAccess } from './useWorkspaceAccess';

const canManage = (workspaces: IWorkspaceItem[], id: string): boolean =>
  workspaces.some((workspace) => workspace.id === id && workspace.canManageWorkspace);

const moveNavItem = (type: TNavItemType, id: string, parentId: string | null, position: number) =>
  type === 'folder' ? moveFolder(id, parentId, position) : moveThread(id, parentId, position);

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
  const [redirecting, setRedirecting] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<IMyInvitation[]>([]);

  const initialized = useRef(false);
  const justCreatedIds = useRef<Set<string>>(new Set());
  const activeWorkspaceRef = useRef<string | null>(null);

  if (redirecting && threadIdParam) setRedirecting(false);

  const activateWorkspace = useCallback((id: string | null) => {
    activeWorkspaceRef.current = id;
    setActiveWorkspaceId(id);
  }, []);

  const loadWorkspaceContent = useCallback(async (workspaceId: string): Promise<TNavItem[] | null> => {
    const [folders, threads] = await Promise.all([getFolders(workspaceId), getThreads(workspaceId)]);
    if (activeWorkspaceRef.current !== workspaceId) return null;

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
      const [, workspaceList] = await Promise.all([createClient().auth.getSession(), getMyWorkspaces()]);
      setWorkspaces(workspaceList);

      const targetWorkspaceId = workspaceIdParam
        ? workspaceList.find((workspace) => workspace.id === workspaceIdParam)?.id
        : workspaceList[0]?.id;

      if (targetWorkspaceId) {
        activateWorkspace(targetWorkspaceId);
        const tree = await loadWorkspaceContent(targetWorkspaceId);

        if (tree && !threadIdParam) {
          const firstThreadId = findFirstThread(tree);
          if (firstThreadId) {
            setRedirecting(true);
            router.replace(`/platform/${targetWorkspaceId}/${firstThreadId}`);
          }
        }
      }

      setLoading(false);
    };

    init().catch((error) => {
      event.error(error, { context: 'sidebar.loadWorkspaces' });
      setLoading(false);
    });
  }, [workspaceIdParam, threadIdParam, activateWorkspace, loadWorkspaceContent, router]);

  useEffect(() => {
    const initial = useCanvasStore.getState();
    let lastThreadId = initial.threadId;
    let lastResolved = isThreadResolved(initial.nodes, initial.edges);

    return useCanvasStore.subscribe((state, previous) => {
      const { threadId, nodes, edges } = state;
      if (!threadId) return;
      if (threadId === lastThreadId && nodes === previous.nodes && edges === previous.edges) return;

      const resolved = isThreadResolved(nodes, edges);
      if (threadId === lastThreadId && resolved === lastResolved) return;

      lastThreadId = threadId;
      lastResolved = resolved;
      setNavItems((prev) => setThreadResolved(prev, threadId, resolved));
    });
  }, []);

  useWorkspaceAccess(activeWorkspaceId);

  const handleWorkspaceSelect = useCallback(
    async (id: string) => {
      if (id === activeWorkspaceId) {
        await loadWorkspaceContent(id).catch((error: unknown) => {
          event.error(error, { title: t.common.errorTitles.loadFailed, context: 'sidebar.selectWorkspace' });
        });

        return;
      }

      const previousWorkspaceId = activeWorkspaceId;
      activateWorkspace(id);
      setEditingItemId(null);
      setEditingWorkspaceId(null);
      setLoading(true);
      const tree = await loadWorkspaceContent(id).catch((error: unknown) => {
        event.error(error, { title: t.common.errorTitles.loadFailed, context: 'sidebar.selectWorkspace' });
        if (activeWorkspaceRef.current === id) activateWorkspace(previousWorkspaceId);

        return null;
      });
      setLoading(false);
      if (!tree) return;

      const firstThreadId = findFirstThread(tree);
      router.push(firstThreadId ? `/platform/${id}/${firstThreadId}` : '/platform');
    },
    [activeWorkspaceId, router, activateWorkspace, loadWorkspaceContent, t],
  );

  const activateFirstWorkspace = useCallback(
    (remaining: IWorkspaceItem[]) => {
      const next = remaining[0];
      activateWorkspace(next?.id ?? null);
      setNavItems([]);
      if (next) reloadWorkspaceContent(next.id);
    },
    [activateWorkspace, reloadWorkspaceContent],
  );

  const handleCreateWorkspace = useCallback(async () => {
    const created = await createWorkspace(t.platform.sidebar.defaultNames.workspace).catch((error: unknown) => {
      event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createWorkspace' });

      return null;
    });
    if (!created) return;

    const newWorkspace: IWorkspaceItem = {
      id: created.id,
      name: created.name,
      canManageWorkspace: true,
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    activateWorkspace(created.id);
    setEditingWorkspaceId(created.id);
    justCreatedIds.current.add(created.id);
    setNavItems([]);
    router.push('/platform');
    event.success(t.platform.sidebar.workspaceCreated);
    awardBadge('workspaceBuilder');
  }, [activateWorkspace, router, t]);

  const reloadWorkspaces = useCallback(async () => {
    const workspaceList = await getMyWorkspaces().catch((error: unknown) => {
      event.error(error, { toast: false, context: 'sidebar.reloadWorkspaces' });

      return null;
    });
    if (!workspaceList) return;

    setWorkspaces(workspaceList);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyInvitations()
      .then((list) => {
        if (!cancelled) setInvitations(list);
      })
      .catch((error) => event.error(error, { toast: false, context: 'sidebar.loadInvitations' }));

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAcceptInvitation = useCallback(
    async (invitation: IMyInvitation) => {
      try {
        await acceptWorkspaceInvitation(invitation.id);
      } catch (error) {
        event.error(error, {
          title: t.platform.sidebar.invitations.acceptFailed,
          context: 'sidebar.acceptInvitation',
        });

        return;
      }

      setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
      await reloadWorkspaces();
      event.success(t.platform.sidebar.invitations.accepted);
      awardBadge('collaborator');
      handleWorkspaceSelect(invitation.workspaceId);
    },
    [reloadWorkspaces, handleWorkspaceSelect, t],
  );

  const handleDeclineInvitation = useCallback(
    async (invitation: IMyInvitation) => {
      try {
        await declineWorkspaceInvitation(invitation.id);
      } catch (error) {
        event.error(error, {
          title: t.platform.sidebar.invitations.declineFailed,
          context: 'sidebar.declineInvitation',
        });

        return;
      }

      setInvitations((prev) => prev.filter((item) => item.id !== invitation.id));
      event.success(t.platform.sidebar.invitations.declined);
    },
    [t],
  );

  const handleRenameWorkspace = useCallback(
    async (id: string, name: string) => {
      if (!canManage(workspaces, id)) return;

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
    [workspaces, reloadWorkspaces, t],
  );

  const handleDeleteWorkspace = useCallback(
    async (id: string) => {
      if (!canManage(workspaces, id)) return;

      try {
        await deleteWorkspace(id);
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.deleteWorkspace' });

        return;
      }

      setWorkspaces((prev) => prev.filter((workspace) => workspace.id !== id));
      if (activeWorkspaceRef.current === id) {
        activateFirstWorkspace(workspaces.filter((workspace) => workspace.id !== id));
        router.push('/platform');
      }

      event.success(t.platform.sidebar.workspaceDeleted);
    },
    [workspaces, router, activateFirstWorkspace, t],
  );

  const handleCreateThread = useCallback(
    async (folderId?: string, name?: string): Promise<string | null> => {
      if (!activeWorkspaceId) return null;
      if (!usePermissionsStore.getState().canManageStructure) return null;

      const thread = await createThread(
        activeWorkspaceId,
        folderId,
        name ?? t.platform.sidebar.defaultNames.thread,
      ).catch((error: unknown) => {
        event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createThread' });

        return null;
      });
      if (!thread) return null;

      event.success(t.platform.sidebar.threadCreated);
      if (!name) awardBadge('firstSteps');
      if (activeWorkspaceRef.current !== activeWorkspaceId) return null;

      const newItem: TNavItem = {
        type: 'thread',
        id: thread.id,
        name: thread.name,
      };
      setNavItems((prev) => (folderId ? insertIntoTree(prev, newItem, folderId, Infinity) : [...prev, newItem]));
      if (!name) {
        setEditingItemId(thread.id);
        justCreatedIds.current.add(thread.id);
      }
      router.push(`/platform/${activeWorkspaceId}/${thread.id}`);

      return thread.id;
    },
    [activeWorkspaceId, router, t],
  );

  const handleCreateFolder = useCallback(async () => {
    if (!activeWorkspaceId) return;
    if (!usePermissionsStore.getState().canManageStructure) return;

    const folder = await createFolder(activeWorkspaceId, undefined, t.platform.sidebar.defaultNames.folder).catch(
      (error: unknown) => {
        event.error(error, { title: t.common.errorTitles.createFailed, context: 'sidebar.createFolder' });

        return null;
      },
    );
    if (!folder) return;

    event.success(t.platform.sidebar.folderCreated);
    if (activeWorkspaceRef.current !== activeWorkspaceId) return;

    setNavItems((prev) => [...prev, { type: 'folder', id: folder.id, name: folder.name, items: [] }]);
    setEditingItemId(folder.id);
    justCreatedIds.current.add(folder.id);
  }, [activeWorkspaceId, t]);

  const handleDeleteItem = useCallback(
    async (id: string) => {
      if (!activeWorkspaceId) return;
      if (!usePermissionsStore.getState().canManageStructure) return;

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

      event.success(item.type === 'folder' ? t.platform.sidebar.folderDeleted : t.platform.sidebar.threadDeleted);
      if (activeWorkspaceRef.current !== activeWorkspaceId) return;

      setNavItems((prev) => removeFromTree(prev, id));

      const shouldNavigate =
        item.type === 'thread' ? threadIdParam === id : threadIdParam && containsThread(item, threadIdParam);
      if (shouldNavigate) {
        router.push('/platform');
      }
    },
    [activeWorkspaceId, navItems, threadIdParam, router, t],
  );

  const handleRenameItem = useCallback(
    async (id: string, name: string) => {
      if (!usePermissionsStore.getState().canManageStructure) return;

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
      if (!usePermissionsStore.getState().canManageStructure) return;

      const oldParentId = findParentId(navItems, id) ?? null;
      const targetSiblings = getSiblings(navItems, parentId);
      const reordered = targetSiblings
        .map((sibling, oldPos) => ({ id: sibling.id, type: sibling.type, oldPos }))
        .filter((sibling) => sibling.id !== id);
      reordered.splice(position, 0, { id, type, oldPos: targetSiblings.findIndex((sibling) => sibling.id === id) });

      setNavItems((prev) => {
        const item = findInTree(prev, id);
        if (!item) return prev;

        return insertIntoTree(removeFromTree(prev, id), item, parentId, position);
      });

      const targetUpdates = reordered
        .map((sibling, newPos) => ({ ...sibling, newPos, parentId }))
        .filter((update) => update.oldPos !== update.newPos);

      const oldSiblings = oldParentId === parentId ? [] : getSiblings(navItems, oldParentId);
      const removedIndex = oldSiblings.findIndex((sibling) => sibling.id === id);
      const compactUpdates =
        removedIndex === -1
          ? []
          : oldSiblings.slice(removedIndex + 1).map((sibling, index) => ({
              id: sibling.id,
              type: sibling.type,
              newPos: removedIndex + index,
              parentId: oldParentId,
            }));

      try {
        await Promise.all(
          [...targetUpdates, ...compactUpdates].map((update) =>
            moveNavItem(update.type, update.id, update.parentId, update.newPos),
          ),
        );
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.moveFailed, context: 'sidebar.moveItem' });
        await reloadWorkspaceContent(activeWorkspaceId);
      }
    },
    [activeWorkspaceId, navItems, reloadWorkspaceContent, t],
  );

  const handleBulkDelete = useCallback(
    async (ids: Set<string>) => {
      if (!activeWorkspaceId) return;
      if (!usePermissionsStore.getState().canManageStructure) return;

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
        await reloadWorkspaceContent(activeWorkspaceId);

        return;
      }

      event.success(t.platform.sidebar.itemsDeleted);
      if (activeWorkspaceRef.current !== activeWorkspaceId) return;

      const shouldNavigate =
        !!threadIdParam &&
        (ids.has(threadIdParam) ||
          resolved.some((item) => item.type === 'folder' && containsThread(item, threadIdParam)));
      if (shouldNavigate) {
        router.push('/platform');
      }
    },
    [activeWorkspaceId, navItems, threadIdParam, router, reloadWorkspaceContent, t],
  );

  const handleBulkDeleteWorkspaces = useCallback(
    async (ids: Set<string>) => {
      const manageableIds = new Set([...ids].filter((id) => canManage(workspaces, id)));
      const skippedCount = ids.size - manageableIds.size;
      if (manageableIds.size === 0) {
        if (skippedCount > 0) event.warning(t.platform.sidebar.workspacesDeleteSkipped);

        return;
      }

      const remaining = workspaces.filter((workspace) => !manageableIds.has(workspace.id));
      setWorkspaces(remaining);
      if (activeWorkspaceId && manageableIds.has(activeWorkspaceId)) {
        activateFirstWorkspace(remaining);
        router.push('/platform');
      }

      try {
        await deleteWorkspaces([...manageableIds]);
        if (skippedCount > 0) {
          event.warning(t.platform.sidebar.workspacesDeleteSkipped);
        } else {
          event.success(t.platform.sidebar.workspacesDeleted);
        }
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.deleteFailed, context: 'sidebar.bulkDeleteWorkspaces' });
        await reloadWorkspaces();
      }
    },
    [workspaces, activeWorkspaceId, router, activateFirstWorkspace, reloadWorkspaces, t],
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
    async (ids: Set<string>, targetParentId: string | null, position: number) => {
      if (!activeWorkspaceId) return;
      if (!usePermissionsStore.getState().canManageStructure) return;

      const targetSiblings = getSiblings(navItems, targetParentId);
      const stayingSiblings = targetSiblings.filter((sibling) => !ids.has(sibling.id));
      const insertAt = Math.min(position, stayingSiblings.length);
      const itemsToMove = findOutermostItems(navItems, ids);

      setNavItems((prev) => {
        const removed = itemsToMove.reduce((acc, item) => removeFromTree(acc, item.id), prev);

        return itemsToMove.reduce(
          (acc, item, index) => insertIntoTree(acc, item, targetParentId, insertAt + index),
          removed,
        );
      });

      const updates = [...stayingSiblings.slice(0, insertAt), ...itemsToMove, ...stayingSiblings.slice(insertAt)]
        .map((item, newPos) => ({
          item,
          newPos,
          oldPos: targetSiblings.findIndex((sibling) => sibling.id === item.id),
        }))
        .filter((update) => update.oldPos !== update.newPos);

      try {
        await Promise.all(updates.map(({ item, newPos }) => moveNavItem(item.type, item.id, targetParentId, newPos)));
      } catch (error) {
        event.error(error, { title: t.common.errorTitles.moveFailed, context: 'sidebar.bulkMove' });
        await reloadWorkspaceContent(activeWorkspaceId);
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

  const activeThread = threadIdParam ? findInTree(navItems, threadIdParam) : null;

  return {
    workspaces,
    activeWorkspaceId,
    navItems,
    activeThreadId: threadIdParam,
    activeThreadName: activeThread?.name ?? null,
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
    loading: loading || redirecting,
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
    invitations,
    onAcceptInvitation: handleAcceptInvitation,
    onDeclineInvitation: handleDeclineInvitation,
    reloadWorkspaces,
  };
};
