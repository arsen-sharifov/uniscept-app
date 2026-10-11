import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceAccess } from '@interfaces';
import { getMyWorkspacePermissions, getUser } from '@api/client';
import { TRANSLATIONS, createTranslations, translate } from '@mocks/i18n';
import { EDIT_ACCESS, FULL_ACCESS } from '@mocks/roles';
import { USER_UNAVAILABLE, USER_RESPONSE } from '@mocks/userApi';
import { useWorkspaceAccess } from '@/app/platform/hooks';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { usePermissionsStore } from '@/lib/stores';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', async () => ({ ...(await import('@mocks/i18n')), useTranslations: vi.fn() }));
vi.mock('@/lib/events', () => import('@mocks/events'));

let rerenderAccess: (props: { workspaceId: string | null }) => void;

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useTranslations).mockReturnValue(translate);
  vi.mocked(getUser).mockResolvedValue(USER_RESPONSE);
});

afterEach(() => {
  usePermissionsStore.getState().clearAccess();
  vi.useRealTimers();
});

describe('useWorkspaceAccess', () => {
  describe('GIVEN edit access behind the api', () => {
    beforeEach(() => {
      vi.mocked(getMyWorkspacePermissions).mockResolvedValue(EDIT_ACCESS);
    });

    describe('WHEN the hook mounts for a workspace', () => {
      beforeEach(async () => {
        renderHook(() => useWorkspaceAccess('ws-1'));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the permissions store carries the fetched access of that workspace', () => {
        expect(getMyWorkspacePermissions).toHaveBeenCalledExactlyOnceWith('ws-1');
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          resolved: true,
          ...EDIT_ACCESS,
        });
      });
    });
  });

  describe('GIVEN access loaded earlier for a workspace', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
    });

    describe('WHEN the hook mounts without a workspace', () => {
      beforeEach(async () => {
        renderHook(() => useWorkspaceAccess(null));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the previous access is cleared and nothing is fetched', () => {
        expect(getMyWorkspacePermissions).not.toHaveBeenCalled();
        expect(usePermissionsStore.getState()).toMatchObject({ workspaceId: null, resolved: false, isOwner: false });
      });
    });
  });

  describe('GIVEN access loaded for the active workspace', () => {
    beforeEach(async () => {
      vi.mocked(getMyWorkspacePermissions).mockResolvedValue(EDIT_ACCESS);
      rerenderAccess = renderHook((props) => useWorkspaceAccess(props.workspaceId), {
        initialProps: { workspaceId: 'ws-1' as string | null },
      }).rerender;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the interface language changes', () => {
      beforeEach(async () => {
        vi.mocked(useTranslations).mockReturnValue(createTranslations());
        act(() => rerenderAccess({ workspaceId: 'ws-1' }));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the loaded access is neither cleared nor fetched again', () => {
        expect(getMyWorkspacePermissions).toHaveBeenCalledOnce();
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: 'user-1',
          resolved: true,
          canEditCanvas: true,
        });
      });
    });

    describe('WHEN another workspace becomes active while its access is still loading', () => {
      beforeEach(() => {
        vi.mocked(getMyWorkspacePermissions).mockReturnValue(Promise.withResolvers<IWorkspaceAccess>().promise);
        act(() => rerenderAccess({ workspaceId: 'ws-2' }));
      });

      test('THEN the access of the previous workspace is dropped until the new one resolves', () => {
        expect(getMyWorkspacePermissions).toHaveBeenLastCalledWith('ws-2');
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-2',
          userId: null,
          resolved: false,
          canEditCanvas: false,
        });
      });
    });
  });

  describe('GIVEN a user the api no longer returns', () => {
    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(USER_UNAVAILABLE as never);
      vi.mocked(getMyWorkspacePermissions).mockResolvedValue(EDIT_ACCESS);
    });

    describe('WHEN the hook mounts for a workspace', () => {
      beforeEach(async () => {
        renderHook(() => useWorkspaceAccess('ws-1'));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the access resolves without a user id', () => {
        expect(usePermissionsStore.getState()).toMatchObject({ workspaceId: 'ws-1', userId: null, resolved: true });
      });
    });
  });

  describe('GIVEN workspace permissions that fail to load', () => {
    beforeEach(() => {
      vi.mocked(getMyWorkspacePermissions).mockRejectedValue(new Error('permissions unavailable'));
    });

    describe('WHEN the hook mounts for a workspace', () => {
      beforeEach(async () => {
        renderHook(() => useWorkspaceAccess('ws-1'));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN access resolves without any grant', () => {
        expect(usePermissionsStore.getState()).toMatchObject({
          workspaceId: 'ws-1',
          userId: null,
          resolved: true,
          isOwner: false,
          canEditCanvas: false,
          canComment: false,
        });
      });

      test('THEN the load failure reaches the feedback boundary', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.loadFailed,
          context: 'sidebar.loadPermissions',
        });
      });
    });
  });

  describe('GIVEN a switch to another workspace while the permission request of the previous one is in flight', () => {
    let resolveFirst: (access: IWorkspaceAccess) => void;
    let rejectFirst: (reason: Error) => void;

    beforeEach(() => {
      const firstRequest = Promise.withResolvers<IWorkspaceAccess>();

      resolveFirst = firstRequest.resolve;
      rejectFirst = firstRequest.reject;
      vi.mocked(getMyWorkspacePermissions).mockReturnValueOnce(firstRequest.promise).mockResolvedValue(EDIT_ACCESS);
      rerenderAccess = renderHook((props) => useWorkspaceAccess(props.workspaceId), {
        initialProps: { workspaceId: 'ws-1' as string | null },
      }).rerender;
      act(() => rerenderAccess({ workspaceId: 'ws-2' }));
    });

    describe('WHEN the stale request resolves after the switch', () => {
      beforeEach(async () => {
        await act(async () => {
          resolveFirst(FULL_ACCESS);
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the access of the new workspace stays', () => {
        expect(usePermissionsStore.getState()).toMatchObject({ workspaceId: 'ws-2', resolved: true, ...EDIT_ACCESS });
      });
    });

    describe('WHEN the stale request fails after the switch', () => {
      beforeEach(async () => {
        await act(async () => {
          rejectFirst(new Error('permissions unavailable'));
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the failure is ignored and the new workspace keeps its access', () => {
        expect(event.error).not.toHaveBeenCalled();
        expect(usePermissionsStore.getState()).toMatchObject({ workspaceId: 'ws-2', resolved: true, ...EDIT_ACCESS });
      });
    });
  });
});
