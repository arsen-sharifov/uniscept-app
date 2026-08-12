import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

import type { IWorkspaceItem, TNavItem } from '@interfaces';
import {
  acceptWorkspaceInvitation,
  createFolder,
  createThread,
  createWorkspace,
  declineWorkspaceInvitation,
  deleteFolder,
  deleteFolders,
  deleteThread,
  deleteThreads,
  deleteWorkspace,
  deleteWorkspaces,
  getFolders,
  getMyInvitations,
  getMyWorkspacePermissions,
  getMyWorkspaces,
  getThreads,
  getUser,
  moveFolder,
  moveThread,
  moveWorkspace,
  updateFolderName,
  updateThreadName,
  updateWorkspaceName,
} from '@api/client';
import { canvasNode } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { EDIT_ACCESS, FULL_ACCESS } from '@mocks/roles';
import { folderInput, folderItem, myInvitation, threadInput, threadItem, workspaceItem } from '@mocks/sidebar';
import { primeSupabase } from '@mocks/supabase';
import { useWorkspaceManager } from '@/app/platform/hooks';
import { event } from '@/lib/events';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useParams: () => routeParams,
}));
vi.mock('@api/client', async () => ({
  ...(await import('@mocks/canvasApi')),
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));
vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

const routerPush = vi.fn();
const routerReplace = vi.fn();
const router = { push: routerPush, replace: routerReplace };
const routeParams: { workspaceId?: string; threadId?: string } = {};

const USER_RESPONSE = { data: { user: { id: 'user-1' } }, error: null } as never;

const workspaceList = (): IWorkspaceItem[] => [
  workspaceItem('ws-1'),
  workspaceItem('ws-2'),
  workspaceItem('ws-3', false),
];

const folderList = () => [folderInput('f1', 1)];

const threadList = () => [threadInput('t1', 0), threadInput('t2', 0, 'f1')];

const INITIAL_TREE: TNavItem[] = [threadItem('t1'), folderItem('f1', [threadItem('t2')])];

const primeApi = (route: { workspaceId?: string; threadId?: string } = {}) => {
  primeSupabase([]);
  vi.mocked(getMyWorkspaces).mockResolvedValue(workspaceList());
  vi.mocked(getUser).mockResolvedValue(USER_RESPONSE);
  vi.mocked(getMyWorkspacePermissions).mockResolvedValue(FULL_ACCESS);
  vi.mocked(getFolders).mockResolvedValue(folderList());
  vi.mocked(getThreads).mockResolvedValue(threadList());
  vi.mocked(getMyInvitations).mockResolvedValue([]);
  Object.assign(routeParams, route);
};

let manager: { current: ReturnType<typeof useWorkspaceManager> };
let unmountManager: () => void;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(async () => {
  cleanup();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  delete routeParams.workspaceId;
  delete routeParams.threadId;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useWorkspaceManager', () => {
  describe('GIVEN workspaces with a nested tree and a pending invitation behind the api', () => {
    beforeEach(() => {
      primeApi();
      vi.mocked(getMyInvitations).mockResolvedValue([myInvitation('inv-1', 'ws-9')]);

      manager = renderHook(() => useWorkspaceManager()).result;
    });

    describe('WHEN the initial load is still in flight', () => {
      test('THEN the manager reports loading with empty state', () => {
        expect(manager.current.loading).toBe(true);
        expect(manager.current.workspaces).toEqual([]);
        expect(manager.current.navItems).toEqual([]);
        expect(manager.current.invitations).toEqual([]);
      });
    });

    describe('WHEN the initial load settles', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the first workspace becomes active with its nav tree', () => {
        expect(manager.current.loading).toBe(false);
        expect(manager.current.workspaces).toEqual(workspaceList());
        expect(manager.current.activeWorkspaceId).toBe('ws-1');
        expect(manager.current.navItems).toEqual(INITIAL_TREE);
      });

      test('THEN the content api is scoped to the active workspace', () => {
        expect(getFolders).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(getThreads).toHaveBeenCalledExactlyOnceWith('ws-1');
      });

      test('THEN the router is redirected to the first thread', () => {
        expect(routerReplace).toHaveBeenCalledExactlyOnceWith('/platform/ws-1/t1');
      });

      test('THEN the pending invitations are exposed', () => {
        expect(manager.current.invitations).toEqual([myInvitation('inv-1', 'ws-9')]);
      });

      test('THEN the permissions store carries the fetched access', () => {
        expect(getMyWorkspacePermissions).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          canManageStructure: true,
        });
      });
    });
  });

  describe('GIVEN a route that already points at a workspace and a thread', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-2', threadId: 't1' });

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the initial load settles', () => {
      test('THEN the routed workspace becomes active', () => {
        expect(manager.current.activeWorkspaceId).toBe('ws-2');
        expect(manager.current.activeThreadId).toBe('t1');
        expect(getFolders).toHaveBeenCalledExactlyOnceWith('ws-2');
      });

      test('THEN no redirect happens', () => {
        expect(routerReplace).not.toHaveBeenCalled();
        expect(routerPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a workspace list that fails to load', () => {
    beforeEach(async () => {
      primeApi();
      vi.mocked(getMyWorkspaces).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the initial load settles', () => {
      test('THEN the failure surfaces and loading ends', () => {
        expect(manager.current.loading).toBe(false);
        expect(manager.current.workspaces).toEqual([]);
        expect(getFolders).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), { context: 'sidebar.loadWorkspaces' });
      });
    });
  });

  describe('GIVEN three loaded workspaces where the member manages the first two', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(createWorkspace).mockResolvedValue({
        id: 'ws-new',
        name: 'New Workspace',
        ownerId: 'user-1',
        createdAt: '2026-01-01T00:00:00Z',
      });

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they create a workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateWorkspace();
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the workspace is appended, activated and put into edit mode', () => {
        expect(manager.current.workspaces).toEqual([
          ...workspaceList(),
          { id: 'ws-new', name: 'New Workspace', canManageWorkspace: true },
        ]);
        expect(manager.current.activeWorkspaceId).toBe('ws-new');
        expect(manager.current.editingWorkspaceId).toBe('ws-new');
        expect(manager.current.navItems).toEqual([]);
      });

      test('THEN the creation reaches the api, the router and the toaster', () => {
        expect(createWorkspace).toHaveBeenCalledExactlyOnceWith('New Workspace');
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.workspaceCreated);
      });
    });

    describe('WHEN they rename a manageable workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameWorkspace('ws-2', 'Research');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the new name shows optimistically and persists', () => {
        expect(manager.current.workspaces).toEqual([
          workspaceItem('ws-1'),
          { id: 'ws-2', name: 'Research', canManageWorkspace: true },
          workspaceItem('ws-3', false),
        ]);
        expect(updateWorkspaceName).toHaveBeenCalledExactlyOnceWith('ws-2', 'Research');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.workspaceRenamed);
      });
    });

    describe('WHEN they rename a workspace they cannot manage', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameWorkspace('ws-3', 'Hijacked');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the workspace stays untouched', () => {
        expect(manager.current.workspaces).toEqual(workspaceList());
        expect(updateWorkspaceName).not.toHaveBeenCalled();
        expect(event.success).not.toHaveBeenCalled();
      });
    });

    describe('WHEN they delete the active workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onDeleteWorkspace('ws-1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the next workspace takes over with a fresh tree', () => {
        expect(manager.current.workspaces).toEqual([workspaceItem('ws-2'), workspaceItem('ws-3', false)]);
        expect(manager.current.activeWorkspaceId).toBe('ws-2');
        expect(deleteWorkspace).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(getFolders).toHaveBeenLastCalledWith('ws-2');
      });

      test('THEN the user is routed home and notified', () => {
        expect(routerPush).toHaveBeenCalledWith('/platform');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.workspaceDeleted);
      });
    });

    describe('WHEN they drag the first workspace to the end', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onMoveWorkspace('ws-1', 2);
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the order updates optimistically', () => {
        expect(manager.current.workspaces.map((workspace) => workspace.id)).toEqual(['ws-2', 'ws-3', 'ws-1']);
      });

      test('THEN every shifted workspace is persisted', () => {
        expect(vi.mocked(moveWorkspace).mock.calls).toEqual([
          ['ws-2', 0],
          ['ws-3', 1],
          ['ws-1', 2],
        ]);
      });
    });

    describe('WHEN they bulk delete a manageable and an unmanageable workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onBulkDeleteWorkspaces(new Set(['ws-2', 'ws-3']));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN only the manageable workspace is deleted with a skip warning', () => {
        expect(manager.current.workspaces).toEqual([workspaceItem('ws-1'), workspaceItem('ws-3', false)]);
        expect(manager.current.activeWorkspaceId).toBe('ws-1');
        expect(deleteWorkspaces).toHaveBeenCalledExactlyOnceWith(['ws-2']);
        expect(event.warning).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.workspacesDeleteSkipped);
        expect(event.success).not.toHaveBeenCalled();
        expect(routerPush).not.toHaveBeenCalled();
      });
    });

    describe('WHEN they bulk delete the active workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onBulkDeleteWorkspaces(new Set(['ws-1']));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the next workspace takes over', () => {
        expect(manager.current.workspaces).toEqual([workspaceItem('ws-2'), workspaceItem('ws-3', false)]);
        expect(manager.current.activeWorkspaceId).toBe('ws-2');
        expect(deleteWorkspaces).toHaveBeenCalledExactlyOnceWith(['ws-1']);
        expect(getFolders).toHaveBeenLastCalledWith('ws-2');
        expect(routerPush).toHaveBeenCalledWith('/platform');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.workspacesDeleted);
      });
    });

    describe('WHEN they select another workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onWorkspaceSelect('ws-2');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the workspace activates and routes to its first thread', () => {
        expect(manager.current.activeWorkspaceId).toBe('ws-2');
        expect(manager.current.loading).toBe(false);
        expect(getFolders).toHaveBeenLastCalledWith('ws-2');
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform/ws-2/t1');
      });
    });
  });

  describe('GIVEN a workspace rename that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(updateWorkspaceName).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they rename a manageable workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameWorkspace('ws-2', 'Research');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the name rolls back from the refetched list', () => {
        expect(manager.current.workspaces).toEqual(workspaceList());
        expect(getMyWorkspaces).toHaveBeenCalledTimes(2);
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.renameFailed,
          context: 'sidebar.renameWorkspace',
        });
        expect(event.success).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a workspace delete that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(deleteWorkspace).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they delete the active workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onDeleteWorkspace('ws-1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the workspace stays and the failure surfaces', () => {
        expect(manager.current.workspaces).toEqual(workspaceList());
        expect(manager.current.activeWorkspaceId).toBe('ws-1');
        expect(routerPush).not.toHaveBeenCalled();
        expect(event.success).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.deleteFailed,
          context: 'sidebar.deleteWorkspace',
        });
      });
    });
  });

  describe('GIVEN a workspace whose content fails to load on selection', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(getFolders).mockRejectedValue(new Error('db down'));
      vi.mocked(getFolders).mockResolvedValueOnce(folderList());

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they select another workspace', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onWorkspaceSelect('ws-2');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the previous workspace is restored', () => {
        expect(manager.current.activeWorkspaceId).toBe('ws-1');
        expect(manager.current.loading).toBe(false);
        expect(routerPush).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.loadFailed,
          context: 'sidebar.selectWorkspace',
        });
      });
    });
  });

  describe('GIVEN a manageable content tree on the active workspace', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(createThread).mockResolvedValue(threadInput('t-new', 2));
      vi.mocked(createFolder).mockResolvedValue(folderInput('f-new', 2));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they create a thread at the root', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateThread();
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the thread appends to the root in edit mode', () => {
        expect(manager.current.navItems).toEqual([
          ...INITIAL_TREE,
          { type: 'thread', id: 't-new', name: 'Thread t-new' },
        ]);
        expect(manager.current.editingItemId).toBe('t-new');
      });

      test('THEN the creation reaches the api and opens the thread', () => {
        expect(createThread).toHaveBeenCalledExactlyOnceWith('ws-1', undefined);
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform/ws-1/t-new');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.threadCreated);
      });
    });

    describe('WHEN they create a thread inside the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateThread('f1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the thread lands at the end of the folder', () => {
        expect(manager.current.navItems).toEqual([
          threadItem('t1'),
          folderItem('f1', [threadItem('t2'), { type: 'thread', id: 't-new', name: 'Thread t-new' }]),
        ]);
        expect(createThread).toHaveBeenCalledExactlyOnceWith('ws-1', 'f1');
      });
    });

    describe('WHEN they create a folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateFolder();
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the folder appends to the root in edit mode', () => {
        expect(manager.current.navItems).toEqual([...INITIAL_TREE, folderItem('f-new')]);
        expect(manager.current.editingItemId).toBe('f-new');
        expect(createFolder).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.folderCreated);
      });
    });

    describe('WHEN they name the freshly created thread', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateThread();
          await vi.advanceTimersByTimeAsync(0);
        });
        await act(async () => {
          await manager.current.onRenameItem('t-new', 'Named question');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the rename persists without a rename toast', () => {
        expect(updateThreadName).toHaveBeenCalledExactlyOnceWith('t-new', 'Named question');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.threadCreated);
      });
    });

    describe('WHEN they rename the root thread', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameItem('t1', 'Sharper question');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the rename shows optimistically and persists', () => {
        expect(manager.current.navItems[0]).toEqual({
          type: 'thread',
          id: 't1',
          name: 'Sharper question',
          answered: false,
        });
        expect(updateThreadName).toHaveBeenCalledExactlyOnceWith('t1', 'Sharper question');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.threadRenamed);
        expect(getFolders).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN they rename the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameItem('f1', 'Sorted');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the rename shows optimistically and persists', () => {
        expect(manager.current.navItems[1]).toMatchObject({ id: 'f1', name: 'Sorted' });
        expect(updateFolderName).toHaveBeenCalledExactlyOnceWith('f1', 'Sorted');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.folderRenamed);
      });
    });

    describe('WHEN they delete the open thread', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onDeleteItem('t1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the thread leaves the tree', () => {
        expect(manager.current.navItems).toEqual([folderItem('f1', [threadItem('t2')])]);
        expect(deleteThread).toHaveBeenCalledExactlyOnceWith('t1');
        expect(deleteFolder).not.toHaveBeenCalled();
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.threadDeleted);
      });

      test('THEN the user is routed away from the deleted thread', () => {
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });

    describe('WHEN they delete the folder that does not hold the open thread', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onDeleteItem('f1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the folder leaves the tree without navigation', () => {
        expect(manager.current.navItems).toEqual([threadItem('t1')]);
        expect(deleteFolder).toHaveBeenCalledExactlyOnceWith('f1');
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.folderDeleted);
        expect(routerPush).not.toHaveBeenCalled();
      });
    });

    describe('WHEN they drag the root thread into the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onMoveItem('t1', 'thread', 'f1', 0);
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree reflects the move optimistically', () => {
        expect(manager.current.navItems).toEqual([folderItem('f1', [threadItem('t1'), threadItem('t2')])]);
      });

      test('THEN the dragged thread and every shifted sibling persist', () => {
        expect(vi.mocked(moveThread).mock.calls).toEqual([
          ['t1', 'f1', 0],
          ['t2', 'f1', 1],
        ]);
        expect(moveFolder).toHaveBeenCalledExactlyOnceWith('f1', null, 0);
      });
    });

    describe('WHEN they bulk move the root thread into the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onBulkMove(new Set(['t1']), 'f1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the thread lands after the existing children', () => {
        expect(manager.current.navItems).toEqual([folderItem('f1', [threadItem('t2'), threadItem('t1')])]);
        expect(moveThread).toHaveBeenCalledExactlyOnceWith('t1', 'f1', 1);
        expect(moveFolder).not.toHaveBeenCalled();
      });
    });

    describe('WHEN they bulk delete the open thread and the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onBulkDelete(new Set(['t1', 'f1']));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree empties through the api', () => {
        expect(manager.current.navItems).toEqual([]);
        expect(deleteThreads).toHaveBeenCalledExactlyOnceWith(['t1']);
        expect(deleteFolders).toHaveBeenCalledExactlyOnceWith(['f1']);
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.itemsDeleted);
      });

      test('THEN the user is routed home', () => {
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });

    describe('WHEN they click a thread inside the folder', () => {
      beforeEach(() => {
        act(() => manager.current.onItemClick('t2'));
      });

      test('THEN the router opens the thread', () => {
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform/ws-1/t2');
      });
    });

    describe('WHEN they click the folder', () => {
      beforeEach(() => {
        act(() => manager.current.onItemClick('f1'));
      });

      test('THEN no navigation happens', () => {
        expect(routerPush).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a thread create that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(createThread).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they create a thread at the root', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateThread();
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree stays and the failure surfaces', () => {
        expect(manager.current.navItems).toEqual(INITIAL_TREE);
        expect(routerPush).not.toHaveBeenCalled();
        expect(event.success).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.createFailed,
          context: 'sidebar.createThread',
        });
      });
    });
  });

  describe('GIVEN a thread rename that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(updateThreadName).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they rename the root thread', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onRenameItem('t1', 'Sharper question');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree rolls back to the server state', () => {
        expect(manager.current.navItems).toEqual(INITIAL_TREE);
        expect(getFolders).toHaveBeenCalledTimes(2);
        expect(event.success).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.renameFailed,
          context: 'sidebar.renameItem',
        });
      });
    });
  });

  describe('GIVEN a move that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(moveThread).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they drag the root thread into the folder', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onMoveItem('t1', 'thread', 'f1', 0);
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree rolls back to the server state', () => {
        expect(manager.current.navItems).toEqual(INITIAL_TREE);
        expect(getFolders).toHaveBeenCalledTimes(2);
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.moveFailed,
          context: 'sidebar.moveItem',
        });
      });
    });
  });

  describe('GIVEN a member who cannot manage the structure', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(getMyWorkspacePermissions).mockResolvedValue(EDIT_ACCESS);

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they try to create and delete items', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onCreateThread();
          await manager.current.onDeleteItem('t1');
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the tree and the api stay untouched', () => {
        expect(manager.current.navItems).toEqual(INITIAL_TREE);
        expect(createThread).not.toHaveBeenCalled();
        expect(deleteThread).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN pending invitations for the member', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(getMyWorkspaces).mockResolvedValue([workspaceItem('ws-1'), workspaceItem('ws-9')]);
      vi.mocked(getMyWorkspaces).mockResolvedValueOnce([workspaceItem('ws-1')]);
      vi.mocked(getMyInvitations).mockResolvedValue([myInvitation('inv-1', 'ws-9'), myInvitation('inv-2', 'ws-8')]);

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they accept the first invitation', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onAcceptInvitation(myInvitation('inv-1', 'ws-9'));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the invitation clears and the workspace list refreshes', () => {
        expect(manager.current.invitations).toEqual([myInvitation('inv-2', 'ws-8')]);
        expect(acceptWorkspaceInvitation).toHaveBeenCalledExactlyOnceWith('inv-1');
        expect(manager.current.workspaces).toEqual([workspaceItem('ws-1'), workspaceItem('ws-9')]);
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.invitations.accepted);
      });

      test('THEN the joined workspace opens', () => {
        expect(manager.current.activeWorkspaceId).toBe('ws-9');
        expect(getFolders).toHaveBeenLastCalledWith('ws-9');
        expect(routerPush).toHaveBeenCalledExactlyOnceWith('/platform/ws-9/t1');
      });
    });

    describe('WHEN they decline the second invitation', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onDeclineInvitation(myInvitation('inv-2', 'ws-8'));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the invitation clears without a workspace refresh', () => {
        expect(manager.current.invitations).toEqual([myInvitation('inv-1', 'ws-9')]);
        expect(declineWorkspaceInvitation).toHaveBeenCalledExactlyOnceWith('inv-2');
        expect(getMyWorkspaces).toHaveBeenCalledTimes(1);
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.sidebar.invitations.declined);
      });
    });
  });

  describe('GIVEN an invitation accept that fails on the api', () => {
    beforeEach(async () => {
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });
      vi.mocked(getMyWorkspaces).mockResolvedValue([workspaceItem('ws-1')]);
      vi.mocked(getMyInvitations).mockResolvedValue([myInvitation('inv-1', 'ws-9'), myInvitation('inv-2', 'ws-8')]);
      vi.mocked(acceptWorkspaceInvitation).mockRejectedValue(new Error('db down'));

      manager = renderHook(() => useWorkspaceManager()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN they accept the first invitation', () => {
      beforeEach(async () => {
        await act(async () => {
          await manager.current.onAcceptInvitation(myInvitation('inv-1', 'ws-9'));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the invitation stays and the failure surfaces', () => {
        expect(manager.current.invitations).toEqual([myInvitation('inv-1', 'ws-9'), myInvitation('inv-2', 'ws-8')]);
        expect(getMyWorkspaces).toHaveBeenCalledTimes(1);
        expect(event.success).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.platform.sidebar.invitations.acceptFailed,
          context: 'sidebar.acceptInvitation',
        });
      });
    });
  });

  describe('GIVEN a manager subscribed to the canvas store', () => {
    let unsubscribeCanvas: Mock<() => void>;

    beforeEach(async () => {
      const canvasSubscribe = useCanvasStore.subscribe;
      vi.spyOn(useCanvasStore, 'subscribe').mockImplementation((listener) => {
        unsubscribeCanvas = vi.fn(canvasSubscribe(listener));

        return unsubscribeCanvas;
      });
      primeApi({ workspaceId: 'ws-1', threadId: 't1' });

      const view = renderHook(() => useWorkspaceManager());

      manager = view.result;
      unmountManager = view.unmount;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the active thread gains an answer node on the canvas', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
      });

      test('THEN the thread shows as answered in the nav tree', () => {
        expect(manager.current.navItems[0]).toEqual({ type: 'thread', id: 't1', name: 'Thread t1', answered: true });
      });
    });

    describe('WHEN the answer node is removed again', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
        act(() => useCanvasStore.setState({ nodes: [canvasNode('n1')] }));
      });

      test('THEN the answered flag clears', () => {
        expect(manager.current.navItems[0]).toEqual({ type: 'thread', id: 't1', name: 'Thread t1', answered: false });
      });
    });

    describe('WHEN the canvas changes without flipping the answer', () => {
      let navItemsBefore: TNavItem[];

      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1')] }));
        navItemsBefore = manager.current.navItems;
        act(() => useCanvasStore.setState({ nodes: [canvasNode('n2')] }));
      });

      test('THEN the nav tree is not recomputed', () => {
        expect(manager.current.navItems).toBe(navItemsBefore);
      });
    });

    describe('WHEN the manager unmounts', () => {
      beforeEach(() => {
        unmountManager();
      });

      test('THEN the canvas subscription is released', () => {
        expect(unsubscribeCanvas).toHaveBeenCalledTimes(1);
      });
    });
  });
});
