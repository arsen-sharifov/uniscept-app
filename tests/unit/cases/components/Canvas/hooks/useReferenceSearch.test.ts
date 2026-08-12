import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { INodeReference } from '@interfaces';
import { searchReferenceTargets } from '@api/client';
import { nodeReference } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { useReferenceSearch } from '@/components/Canvas/hooks';
import { event } from '@/lib/events';
import { useCanvasStore } from '@/lib/stores';

vi.mock('@api/client', () => import('@mocks/canvasApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

let search: { current: INodeReference[] };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(async () => {
  cleanup();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  useCanvasStore.getState().clearCanvas();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useReferenceSearch', () => {
  describe('GIVEN an open reference search over a backend with two targets', () => {
    beforeEach(async () => {
      vi.mocked(searchReferenceTargets).mockResolvedValue([nodeReference('r1'), nodeReference('r2')]);
      useCanvasStore.getState().setReferenceSearchPosition({ x: 100, y: 200 });

      search = renderHook(() => useReferenceSearch({ workspaceId: 'ws-1', threadId: 'thread-1' })).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the search settles', () => {
      test('THEN the matching targets are exposed', () => {
        expect(search.current).toEqual([nodeReference('r1'), nodeReference('r2')]);
      });

      test('THEN the api is queried once with the workspace and the excluded thread', () => {
        expect(searchReferenceTargets).toHaveBeenCalledExactlyOnceWith('ws-1', 'thread-1');
      });
    });

    describe('WHEN the panel closes', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().setReferenceSearchPosition(null));
      });

      test('THEN the exposed list empties without another search', () => {
        expect(search.current).toEqual([]);
        expect(searchReferenceTargets).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN a closed reference search panel', () => {
    beforeEach(async () => {
      vi.mocked(searchReferenceTargets).mockResolvedValue([nodeReference('r1')]);

      search = renderHook(() => useReferenceSearch({ workspaceId: 'ws-1', threadId: 'thread-1' })).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the hook settles', () => {
      test('THEN no search reaches the api and the list stays empty', () => {
        expect(search.current).toEqual([]);
        expect(searchReferenceTargets).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a search that fails behind an open panel', () => {
    beforeEach(async () => {
      vi.mocked(searchReferenceTargets).mockRejectedValue(new Error('db down'));
      useCanvasStore.getState().setReferenceSearchPosition({ x: 100, y: 200 });

      search = renderHook(() => useReferenceSearch({ workspaceId: 'ws-1', threadId: 'thread-1' })).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the failure settles', () => {
      test('THEN the list stays empty', () => {
        expect(search.current).toEqual([]);
      });

      test('THEN the failure routes to the events boundary with the localized title', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.searchFailed,
          context: 'canvas.referenceSearch',
        });
      });
    });
  });

  describe('GIVEN an unmount while the search is still in flight', () => {
    let rejectSearch: (reason: Error) => void;

    beforeEach(() => {
      const inFlightSearch = Promise.withResolvers<INodeReference[]>();

      rejectSearch = inFlightSearch.reject;
      vi.mocked(searchReferenceTargets).mockReturnValue(inFlightSearch.promise);
      useCanvasStore.getState().setReferenceSearchPosition({ x: 100, y: 200 });

      const view = renderHook(() => useReferenceSearch({ workspaceId: 'ws-1', threadId: 'thread-1' }));

      search = view.result;
      view.unmount();
    });

    describe('WHEN the stale search fails after the unmount', () => {
      beforeEach(async () => {
        rejectSearch(new Error('too late'));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the failure never reaches the events boundary', () => {
        expect(event.error).not.toHaveBeenCalled();
        expect(search.current).toEqual([]);
      });
    });
  });

  describe('GIVEN a workspace switch while the first search is still in flight', () => {
    let resolveStaleSearch: (results: INodeReference[]) => void;

    beforeEach(async () => {
      const staleSearch = Promise.withResolvers<INodeReference[]>();

      resolveStaleSearch = staleSearch.resolve;
      vi.mocked(searchReferenceTargets).mockResolvedValue([nodeReference('fresh')]);
      vi.mocked(searchReferenceTargets).mockReturnValueOnce(staleSearch.promise);
      useCanvasStore.getState().setReferenceSearchPosition({ x: 100, y: 200 });

      const view = renderHook(
        ({ workspaceId }: { workspaceId: string }) => useReferenceSearch({ workspaceId, threadId: 'thread-1' }),
        { initialProps: { workspaceId: 'ws-1' } },
      );

      search = view.result;
      view.rerender({ workspaceId: 'ws-2' });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the stale search resolves after the fresh one', () => {
      beforeEach(async () => {
        resolveStaleSearch([nodeReference('stale')]);
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the fresh workspace results survive the late resolution', () => {
        expect(search.current).toEqual([nodeReference('fresh')]);
      });

      test('THEN each search is scoped to its own workspace', () => {
        expect(vi.mocked(searchReferenceTargets).mock.calls).toEqual([
          ['ws-1', 'thread-1'],
          ['ws-2', 'thread-1'],
        ]);
      });
    });
  });
});
