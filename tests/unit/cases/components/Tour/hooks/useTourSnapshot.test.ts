import { act, cleanup, renderHook, type RenderHookResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ITourSnapshot, ITourSnapshotInput, TNavItem, TTourSignal } from '@interfaces';
import { ANCHOR_POLL_MS } from '@constants';
import { THREAD_ID, canvasEdge, canvasNode, questionNode } from '@mocks/canvas';
import { countReferenceTargets } from '@mocks/canvasApi';
import { event } from '@mocks/events';
import { FULL_TOUR_ACCESS } from '@mocks/onboarding';
import { FULL_ACCESS } from '@mocks/roles';
import { ECanvasTool } from '@/components/tools';
import { useTourSnapshot } from '@/components/Tour/hooks';
import { useOnboardingStore } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@api/client', () => import('@mocks/canvasApi'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const TREE: TNavItem[] = [
  { type: 'thread', id: 'loose', name: 'Loose thread' },
  {
    type: 'folder',
    id: 'research',
    name: 'Research',
    items: [{ type: 'thread', id: 'nested', name: 'Nested thread' }],
  },
];

const CANVAS = { nodes: [questionNode('q'), canvasNode('n1')], edges: [canvasEdge('e1', 'q', 'n1')] };

const tourInput = (overrides: Partial<ITourSnapshotInput> = {}): ITourSnapshotInput => ({
  items: TREE,
  workspaceId: 'ws-1',
  workspaceCount: 2,
  threadId: THREAD_ID,
  active: true,
  ...overrides,
});

let view: RenderHookResult<ITourSnapshot, ITourSnapshotInput>;

beforeEach(() => {
  vi.useFakeTimers();
  countReferenceTargets.mockResolvedValue(0);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  useOnboardingStore.getState().forget();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  vi.useRealTimers();
});

describe('useTourSnapshot', () => {
  describe('GIVEN the canvas of the open thread is loaded', () => {
    beforeEach(() => {
      useCanvasStore.getState().loadCanvas(THREAD_ID, CANVAS);
    });

    describe('WHEN the tour is running', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the snapshot carries the open thread with its nodes and edges', () => {
        expect(view.result.current).toMatchObject({ threadId: THREAD_ID, nodes: CANVAS.nodes, edges: CANVAS.edges });
      });
    });

    describe('WHEN the tour is idle', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ active: false }) });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN no nodes or edges are handed out', () => {
        expect(view.result.current).toMatchObject({ nodes: [], edges: [] });
      });
    });
  });

  describe('GIVEN the store still holds the canvas of a thread the user has left', () => {
    beforeEach(() => {
      useCanvasStore.getState().loadCanvas('thread-left', CANVAS);
    });

    describe('WHEN the tour runs while another thread is open', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the stale canvas is left out and no thread counts as open', () => {
        expect(view.result.current).toMatchObject({ threadId: null, nodes: [], edges: [] });
      });
    });

    describe('WHEN the tour runs with no thread open', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ threadId: null }) });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the stale canvas is left out as well', () => {
        expect(view.result.current).toMatchObject({ threadId: null, nodes: [], edges: [] });
      });
    });
  });

  describe('GIVEN a workspace with three reference targets outside the open thread', () => {
    beforeEach(() => {
      countReferenceTargets.mockResolvedValue(3);
      useCanvasStore.getState().loadCanvas(THREAD_ID, CANVAS);
    });

    describe('WHEN the tour is running', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the targets outside the open thread are counted into the snapshot', () => {
        expect(countReferenceTargets).toHaveBeenCalledExactlyOnceWith('ws-1', THREAD_ID);
        expect(view.result.current.referenceTargetCount).toBe(3);
      });
    });

    describe('WHEN the tour is running with no thread open', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ threadId: null }) });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the targets of the whole workspace are counted', () => {
        expect(countReferenceTargets).toHaveBeenCalledExactlyOnceWith('ws-1', undefined);
        expect(view.result.current.referenceTargetCount).toBe(3);
      });
    });

    describe('WHEN the tour is idle', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ active: false }) });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN nothing is counted and the count stays at zero', () => {
        expect(countReferenceTargets).not.toHaveBeenCalled();
        expect(view.result.current.referenceTargetCount).toBe(0);
      });
    });

    describe('WHEN no workspace is open', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ workspaceId: null }) });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN no count is requested', () => {
        expect(countReferenceTargets).not.toHaveBeenCalled();
        expect(view.result.current.referenceTargetCount).toBe(0);
      });
    });
  });

  describe('GIVEN the count for the current workspace is still in flight', () => {
    let settleStale: (count: number) => void;

    beforeEach(async () => {
      const stale = Promise.withResolvers<number>();
      settleStale = stale.resolve;
      countReferenceTargets.mockReturnValueOnce(stale.promise).mockResolvedValueOnce(1);
      useCanvasStore.getState().loadCanvas(THREAD_ID, CANVAS);

      view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
      await act(() => vi.advanceTimersByTimeAsync(0));
    });

    describe('WHEN the user switches workspace and the stale count arrives last', () => {
      beforeEach(async () => {
        view.rerender(tourInput({ workspaceId: 'ws-2' }));
        await act(() => vi.advanceTimersByTimeAsync(0));
        settleStale(5);
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN only the count for the new workspace is kept', () => {
        expect(countReferenceTargets).toHaveBeenLastCalledWith('ws-2', THREAD_ID);
        expect(view.result.current.referenceTargetCount).toBe(1);
      });
    });
  });

  describe('GIVEN reference targets that cannot be counted', () => {
    beforeEach(() => {
      countReferenceTargets.mockRejectedValue(new Error('Count unavailable'));
    });

    describe('WHEN the tour is running', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the failure is logged without a toast and the count stays at zero', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          toast: false,
          context: 'onboarding.referenceTargets',
        });
        expect(view.result.current.referenceTargetCount).toBe(0);
      });
    });
  });

  describe('GIVEN the settings modal is on screen', () => {
    beforeEach(() => {
      document.body.insertAdjacentHTML('beforeend', '<div data-tour="settingsModal"></div>');
    });

    describe('WHEN the tour runs for one poll interval', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(ANCHOR_POLL_MS));
      });

      test('THEN the modal is listed as visible', () => {
        expect([...view.result.current.visibleAnchors]).toEqual(['settingsModal']);
      });
    });

    describe('WHEN the tour stays idle for the same time', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput({ active: false }) });
        await act(() => vi.advanceTimersByTimeAsync(ANCHOR_POLL_MS));
      });

      test('THEN no anchor is listed', () => {
        expect(view.result.current.visibleAnchors.size).toBe(0);
      });
    });
  });

  describe('GIVEN the tour already lists the settings modal as visible', () => {
    let previous: ITourSnapshot;

    beforeEach(async () => {
      document.body.insertAdjacentHTML('beforeend', '<div data-tour="settingsModal"></div>');
      view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
      await act(() => vi.advanceTimersByTimeAsync(ANCHOR_POLL_MS));
      previous = view.result.current;
    });

    describe('WHEN the next poll finds the same anchors', () => {
      beforeEach(async () => {
        await act(() => vi.advanceTimersByTimeAsync(ANCHOR_POLL_MS));
      });

      test('THEN the snapshot stays the same object', () => {
        expect(view.result.current).toBe(previous);
      });
    });

    describe('WHEN the modal closes before the next poll', () => {
      beforeEach(async () => {
        document.querySelector('[data-tour="settingsModal"]')?.remove();
        await act(() => vi.advanceTimersByTimeAsync(ANCHOR_POLL_MS));
      });

      test('THEN the modal drops off the list', () => {
        expect(view.result.current.visibleAnchors.size).toBe(0);
      });
    });

    describe('WHEN the tour stops', () => {
      beforeEach(() => {
        view.rerender(tourInput({ active: false }));
      });

      test('THEN the list empties at once', () => {
        expect(view.result.current.visibleAnchors.size).toBe(0);
      });
    });
  });

  describe('GIVEN a member with full rights who has started a connection and opened the comments of a node', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, CANVAS);
      useCanvasStore.setState({ activeTool: ECanvasTool.Connect, pendingConnection: 'q', openCommentsNodeId: 'n1' });
      useOnboardingStore.setState({ signals: new Set<TTourSignal>(['nodeLabelled']) });
    });

    describe('WHEN the tour is running', () => {
      beforeEach(async () => {
        view = renderHook((input) => useTourSnapshot(input), { initialProps: tourInput() });
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the snapshot carries the tool state, the rights, the signals and the tree counts', () => {
        expect(view.result.current).toMatchObject({
          activeTool: ECanvasTool.Connect,
          pendingConnection: 'q',
          openCommentsNodeId: 'n1',
          permissions: FULL_TOUR_ACCESS,
          signals: new Set(['nodeLabelled']),
          workspaceCount: 2,
          folderCount: 1,
          nestedThreadCount: 1,
        });
      });
    });
  });
});
