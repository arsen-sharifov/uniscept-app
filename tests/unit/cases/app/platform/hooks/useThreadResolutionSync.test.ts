import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type Mock } from 'vitest';

import type { TNavItem } from '@interfaces';

import { canvasEdge, canvasNode } from '@mocks/canvas';
import { folderItem, threadItem, INITIAL_TREE } from '@mocks/sidebar';
import { useThreadResolutionSync } from '@/app/platform/hooks';
import { useCanvasStore } from '@/lib/stores';

let navItems: { current: TNavItem[] };
let unmountSync: () => void;

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  vi.restoreAllMocks();
});

describe('useThreadResolutionSync', () => {
  describe('GIVEN a nav tree synced with an empty canvas', () => {
    let unsubscribeCanvas: Mock<() => void>;

    beforeEach(() => {
      const canvasSubscribe = useCanvasStore.subscribe;
      vi.spyOn(useCanvasStore, 'subscribe').mockImplementation((listener) => {
        unsubscribeCanvas = vi.fn(canvasSubscribe(listener));

        return unsubscribeCanvas;
      });

      const view = renderHook(() => {
        const [items, setItems] = useState(INITIAL_TREE);
        useThreadResolutionSync(setItems);

        return items;
      });

      navItems = view.result;
      unmountSync = view.unmount;
    });

    describe('WHEN the open thread gains an answer node', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
      });

      test('THEN the thread shows as resolved in the nav tree', () => {
        expect(navItems.current).toEqual([threadItem('t1', true), folderItem('f1', [threadItem('t2')])]);
      });
    });

    describe('WHEN the answer node is removed again', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
        act(() => useCanvasStore.setState({ nodes: [canvasNode('n1')] }));
      });

      test('THEN the resolved mark clears', () => {
        expect(navItems.current[0]).toEqual(threadItem('t1'));
      });
    });

    describe('WHEN the answer node is reached from a refuted node', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore.setState({
            threadId: 't1',
            nodes: [canvasNode('n0', { status: 'invalid' }), canvasNode('n1', { isAnswer: true })],
            edges: [canvasEdge('e1', 'n0', 'n1')],
          }),
        );
      });

      test('THEN the tainted answer leaves the thread unresolved', () => {
        expect(navItems.current[0]).toEqual(threadItem('t1'));
      });
    });

    describe('WHEN an edge from a refuted node to the answer is removed', () => {
      beforeEach(() => {
        act(() =>
          useCanvasStore.setState({
            threadId: 't1',
            nodes: [canvasNode('n0', { status: 'invalid' }), canvasNode('n1', { isAnswer: true })],
            edges: [canvasEdge('e1', 'n0', 'n1')],
          }),
        );
        act(() => useCanvasStore.setState({ edges: [] }));
      });

      test('THEN the edge change alone resolves the thread', () => {
        expect(navItems.current[0]).toEqual(threadItem('t1', true));
      });
    });

    describe('WHEN the canvas opens another resolved thread', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
        act(() => useCanvasStore.setState({ threadId: 't2', nodes: [canvasNode('n2', { isAnswer: true })] }));
      });

      test('THEN both threads carry the resolved mark', () => {
        expect(navItems.current).toEqual([threadItem('t1', true), folderItem('f1', [threadItem('t2', true)])]);
      });
    });

    describe('WHEN the canvas changes without flipping the resolution', () => {
      let navItemsBefore: TNavItem[];

      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1')] }));
        navItemsBefore = navItems.current;
        act(() => useCanvasStore.setState({ nodes: [canvasNode('n2')] }));
      });

      test('THEN the nav tree is not recomputed', () => {
        expect(navItems.current).toBe(navItemsBefore);
      });
    });

    describe('WHEN only canvas state outside the graph changes', () => {
      let navItemsBefore: TNavItem[];

      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] }));
        navItemsBefore = navItems.current;
        act(() => useCanvasStore.setState({ hydrated: true }));
      });

      test('THEN the nav tree is not recomputed', () => {
        expect(navItems.current).toBe(navItemsBefore);
        expect(navItems.current[0]).toEqual(threadItem('t1', true));
      });
    });

    describe('WHEN the canvas holds nodes without a loaded thread', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ threadId: null, nodes: [canvasNode('n1', { isAnswer: true })] }));
      });

      test('THEN no thread is marked', () => {
        expect(navItems.current).toBe(INITIAL_TREE);
      });
    });

    describe('WHEN the hook unmounts', () => {
      beforeEach(() => {
        unmountSync();
      });

      test('THEN the canvas subscription is released', () => {
        expect(unsubscribeCanvas).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a nav tree synced while the canvas already shows the resolved thread', () => {
    beforeEach(() => {
      useCanvasStore.setState({ threadId: 't1', nodes: [canvasNode('n1', { isAnswer: true })] });

      navItems = renderHook(() => {
        const [items, setItems] = useState(INITIAL_TREE);
        useThreadResolutionSync(setItems);

        return items;
      }).result;
    });

    describe('WHEN a node change keeps the thread resolved', () => {
      beforeEach(() => {
        act(() => useCanvasStore.setState({ nodes: [canvasNode('n1', { isAnswer: true }), canvasNode('n2')] }));
      });

      test('THEN the nav tree is not recomputed', () => {
        expect(navItems.current).toBe(INITIAL_TREE);
      });
    });
  });
});
