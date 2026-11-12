import { act, renderHook } from '@testing-library/react';
import { ReactFlowProvider, useStoreApi } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TCanvasNode } from '@interfaces';

import { stubAnimationFrame } from '@mocks/browser';
import { canvasNode, questionNode } from '@mocks/canvas';
import {
  VIEW,
  DEFAULT_VIEWPORT,
  REMEMBERED_VIEWPORT,
  MOVED_VIEWPORT,
  RESIZED_VIEW,
  RECENTERED_VIEWPORT,
} from '@mocks/geometry';
import { routePath, router, searchParams } from '@mocks/navigation';
import {
  ARRIVAL_CLEANUP_MS,
  ARRIVAL_FIT_DURATION_MS,
  ARRIVAL_FIT_PADDING,
  FIT_REQUEST_DURATION_MS,
  FRESH_FIT_PADDING,
} from '@/components/Canvas/consts';
import { useCanvasViewport } from '@/components/Canvas/hooks';
import { recallViewport, rememberViewport } from '@/lib/canvas';
import { useCanvasStore } from '@/lib/stores';

vi.mock('next/navigation', () => import('@mocks/navigation'));

const onSetViewport = vi.fn();

const nodeAt = (id: string, x: number, y: number): TCanvasNode => ({
  ...canvasNode(id),
  position: { x, y },
  measured: { width: 200, height: 80 },
});

let frames: ReturnType<typeof stubAnimationFrame>;
let harness: {
  current: { viewport: ReturnType<typeof useCanvasViewport>; flow: ReturnType<typeof useStoreApi> };
};

beforeEach(() => {
  frames = stubAnimationFrame();
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  searchParams.delete('focus');
  searchParams.delete('node');
  routePath.pathname = '/';
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useCanvasViewport', () => {
  describe('GIVEN a thread whose viewport was remembered earlier in the session', () => {
    beforeEach(() => {
      rememberViewport('thread-remembered', REMEMBERED_VIEWPORT);
      harness = renderHook(
        () => ({
          viewport: useCanvasViewport({ threadId: 'thread-remembered', defaultZoom: 100 }),
          flow: useStoreApi(),
        }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ ...VIEW, panZoom: { setViewport: onSetViewport } as never });
    });

    describe('WHEN the canvas mounts', () => {
      test('THEN the remembered viewport is the starting viewport', () => {
        expect(harness.current.viewport.defaultViewport).toEqual(REMEMBERED_VIEWPORT);
      });
    });

    describe('WHEN its canvas loads with a node far outside the view', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('thread-remembered', { nodes: [nodeAt('far', 5000, 5000)], edges: [], authors: {} }),
        );
        act(() => frames.flush());
      });

      test('THEN the remembered viewport is restored instead of fitting', () => {
        expect(onSetViewport).toHaveBeenCalledExactlyOnceWith(REMEMBERED_VIEWPORT, undefined);
        expect(harness.current.flow.getState().fitViewQueued).toBe(false);
      });
    });
  });

  describe('GIVEN a first open while the store still holds the previous thread', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-first', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ ...VIEW, panZoom: { setViewport: onSetViewport } as never });
      act(() =>
        useCanvasStore
          .getState()
          .loadCanvas('thread-previous', { nodes: [nodeAt('old', 5000, 5000)], edges: [], authors: {} }),
      );
    });

    describe('WHEN a frame passes before its own canvas loads', () => {
      beforeEach(() => {
        act(() => frames.flush());
      });

      test('THEN the viewport is left alone', () => {
        expect(onSetViewport).not.toHaveBeenCalled();
        expect(harness.current.flow.getState().fitViewQueued).toBe(false);
      });
    });

    describe('WHEN its own canvas loads with every node inside the view', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('thread-first', { nodes: [nodeAt('inside', 100, 100)], edges: [], authors: {} }),
        );
        act(() => frames.flush());
      });

      test('THEN the default viewport is applied once and nothing is fitted', () => {
        expect(onSetViewport).toHaveBeenCalledExactlyOnceWith(DEFAULT_VIEWPORT, undefined);
        expect(harness.current.flow.getState().fitViewQueued).toBe(false);
      });
    });
  });

  describe('GIVEN a first open of a thread with a node fully outside the view', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-wide', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ ...VIEW, panZoom: { setViewport: onSetViewport } as never });
    });

    describe('WHEN its canvas loads and the first frame runs', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore.getState().loadCanvas('thread-wide', {
            nodes: [nodeAt('inside', 100, 100), nodeAt('far', 2000, 100)],
            edges: [],
            authors: {},
          }),
        );
        act(() => frames.flush());
      });

      test('THEN a fit with the fresh padding is queued', () => {
        expect(harness.current.flow.getState()).toMatchObject({
          fitViewQueued: true,
          fitViewOptions: { duration: 0, padding: FRESH_FIT_PADDING, maxZoom: 1 },
        });
      });
    });
  });

  describe('GIVEN an open thread', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-moved', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
    });

    describe('WHEN the viewport stops moving', () => {
      beforeEach(() => {
        act(() => harness.current.viewport.onMoveEnd(null, MOVED_VIEWPORT));
      });

      test('THEN the viewport is remembered for that thread', () => {
        expect(recallViewport('thread-moved')).toEqual(MOVED_VIEWPORT);
      });
    });
  });

  describe('GIVEN an arrival from a reference that names the node to show', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      searchParams.set('focus', 'ref');
      searchParams.set('node', 'target');
      routePath.pathname = '/platform/ws-1/thread-arrival';
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-arrival', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ ...VIEW, panZoom: { setViewport: onSetViewport } as never });
    });

    describe('WHEN the canvas has not loaded yet', () => {
      test('THEN the arrival has not started', () => {
        expect(harness.current.viewport.arriving).toBe(false);
      });
    });

    describe('WHEN its canvas loads and the first frame runs', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('thread-arrival', { nodes: [nodeAt('target', 3000, 3000)], edges: [], authors: {} }),
        );
        act(() => frames.flush());
      });

      test('THEN the arrival flies to the named node instead of applying the default viewport', () => {
        expect(harness.current.viewport.arriving).toBe(true);
        expect(harness.current.flow.getState()).toMatchObject({
          fitViewQueued: true,
          fitViewOptions: {
            duration: ARRIVAL_FIT_DURATION_MS,
            padding: ARRIVAL_FIT_PADDING,
            nodes: [{ id: 'target' }],
          },
        });
        expect(onSetViewport).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the window is resized while the arrival glides to the node', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('thread-arrival', { nodes: [nodeAt('target', 3000, 3000)], edges: [], authors: {} }),
        );
        act(() => frames.flush());
        act(() => harness.current.flow.setState(RESIZED_VIEW));
      });

      test('THEN the glide is not cut short by recentring the view', () => {
        expect(harness.current.viewport.arriving).toBe(true);
        expect(onSetViewport).not.toHaveBeenCalled();
      });
    });

    describe('WHEN its canvas holds only an unnamed question', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore.getState().loadCanvas('thread-arrival', {
            nodes: [questionNode('q', '')],
            edges: [],
            authors: {},
          }),
        );
        act(() => frames.flush());
      });

      test('THEN the arrival does not open the question for editing', () => {
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
      });
    });

    describe('WHEN its canvas loads and the arrival settles', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().loadCanvas('thread-arrival', { nodes: [], edges: [], authors: {} }));
        act(() => vi.advanceTimersByTime(ARRIVAL_CLEANUP_MS));
      });

      test('THEN the arrival parameters leave the address without a scroll', () => {
        expect(router.replace).toHaveBeenCalledExactlyOnceWith('/platform/ws-1/thread-arrival', { scroll: false });
      });
    });
  });

  describe('GIVEN an arrival from a reference without a node to show', () => {
    beforeEach(() => {
      searchParams.set('focus', 'ref');
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-arrival', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
    });

    describe('WHEN its canvas loads and the first frame runs', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('thread-arrival', { nodes: [nodeAt('n1', 0, 0)], edges: [], authors: {} }),
        );
        act(() => frames.flush());
      });

      test('THEN the whole canvas is fitted', () => {
        expect(harness.current.flow.getState().fitViewOptions).toEqual({
          duration: ARRIVAL_FIT_DURATION_MS,
          padding: ARRIVAL_FIT_PADDING,
        });
      });
    });
  });

  describe('GIVEN a first open of a thread that holds only its unnamed question', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-fresh', defaultZoom: 75 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ ...VIEW, panZoom: { setViewport: onSetViewport } as never });
    });

    describe('WHEN its canvas loads and the first frame runs', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore.getState().loadCanvas('thread-fresh', {
            nodes: [questionNode('q', '  ')],
            edges: [],
            authors: {},
          }),
        );
        act(() => frames.flush());
      });

      test('THEN the question opens for editing and is fitted without passing the default zoom', () => {
        expect(useCanvasStore.getState().editingNodeId).toBe('q');
        expect(harness.current.flow.getState()).toMatchObject({
          fitViewQueued: true,
          fitViewOptions: { duration: 0, padding: FRESH_FIT_PADDING, maxZoom: 0.75 },
        });
      });
    });
  });

  describe('GIVEN a loaded thread', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-fit', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      act(() =>
        useCanvasStore.getState().loadCanvas('thread-fit', { nodes: [nodeAt('n1', 0, 0)], edges: [], authors: {} }),
      );
      act(() => frames.flush());
      harness.current.flow.setState({ fitViewQueued: false, fitViewOptions: undefined });
    });

    describe('WHEN a fit is asked for with room kept free', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().requestFit({ padding: { top: '80px' } }));
      });

      test('THEN the canvas is fitted with that padding', () => {
        expect(harness.current.flow.getState()).toMatchObject({
          fitViewQueued: true,
          fitViewOptions: { duration: FIT_REQUEST_DURATION_MS, padding: { top: '80px' }, maxZoom: 1 },
        });
      });
    });

    describe('WHEN a fit is asked for around one node', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().requestFit({ padding: { right: '340px' }, nodeIds: ['n1'] }));
      });

      test('THEN only that node is fitted into view', () => {
        expect(harness.current.flow.getState().fitViewOptions).toEqual({
          nodes: [{ id: 'n1' }],
          duration: FIT_REQUEST_DURATION_MS,
          padding: { right: '340px' },
          maxZoom: 1,
        });
      });
    });

    describe('WHEN a fit is asked for without padding', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().requestFit());
      });

      test('THEN the canvas is fitted with the fresh padding', () => {
        expect(harness.current.flow.getState().fitViewOptions).toEqual({
          duration: FIT_REQUEST_DURATION_MS,
          padding: FRESH_FIT_PADDING,
          maxZoom: 1,
        });
      });
    });

    describe('WHEN something other than a fit request changes in the store', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().setMiddlePan(true));
      });

      test('THEN nothing is fitted', () => {
        expect(harness.current.flow.getState().fitViewQueued).toBe(false);
      });
    });
  });

  describe('GIVEN a canvas that has not been measured yet', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-sized', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({ panZoom: { setViewport: onSetViewport } as never });
    });

    describe('WHEN it is measured for the first time', () => {
      beforeEach(() => {
        act(() => harness.current.flow.setState(VIEW));
      });

      test('THEN the view is left as it is', () => {
        expect(onSetViewport).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a measured canvas showing a panned and zoomed view', () => {
    beforeEach(() => {
      harness = renderHook(
        () => ({ viewport: useCanvasViewport({ threadId: 'thread-sized', defaultZoom: 100 }), flow: useStoreApi() }),
        { wrapper: ReactFlowProvider },
      ).result;
      harness.current.flow.setState({
        ...VIEW,
        transform: [REMEMBERED_VIEWPORT.x, REMEMBERED_VIEWPORT.y, REMEMBERED_VIEWPORT.zoom],
        panZoom: { setViewport: onSetViewport } as never,
      });
    });

    describe('WHEN the window resizes the canvas', () => {
      beforeEach(() => {
        act(() => harness.current.flow.setState(RESIZED_VIEW));
      });

      test('THEN the view moves so its centre stays in place', () => {
        expect(onSetViewport).toHaveBeenCalledExactlyOnceWith(RECENTERED_VIEWPORT, undefined);
      });
    });

    describe('WHEN the canvas is hidden and loses its size', () => {
      beforeEach(() => {
        act(() => harness.current.flow.setState({ width: 0, height: 0 }));
      });

      test('THEN the view is left as it is', () => {
        expect(onSetViewport).not.toHaveBeenCalled();
      });
    });

    describe('WHEN only the view changes', () => {
      beforeEach(() => {
        act(() =>
          harness.current.flow.setState({ transform: [MOVED_VIEWPORT.x, MOVED_VIEWPORT.y, MOVED_VIEWPORT.zoom] }),
        );
      });

      test('THEN nothing is moved back', () => {
        expect(onSetViewport).not.toHaveBeenCalled();
      });
    });
  });
});
