import { act, renderHook } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { PannedFlowProvider, THREAD_ID, canvasEdge, canvasNode, referenceNode } from '@mocks/canvas';
import { COMMENT_ACCESS, EDIT_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { useCanvasContextMenu } from '@/components/Canvas/hooks';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

const contextMenuEvent = (clientX: number, clientY: number) =>
  new MouseEvent('contextmenu', { clientX, clientY, cancelable: true });

let harness: { current: ReturnType<typeof useCanvasContextMenu> };
let rightClick: MouseEvent;

beforeEach(() => {
  rightClick = contextMenuEvent(40, 60);
  useCanvasStore.getState().loadCanvas(THREAD_ID, {
    nodes: [canvasNode('n1'), canvasNode('n2'), referenceNode('r1')],
    edges: [canvasEdge('e1', 'n1', 'n2')],
    authors: {},
  });
  useCanvasStore.getState().setOpenCommentsNodeId('n2');
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('useCanvasContextMenu', () => {
  describe('GIVEN an editor with the comments of a node open in a viewport panned by 20 and 40 at double zoom', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
      harness = renderHook(useCanvasContextMenu, { wrapper: PannedFlowProvider }).result;
    });

    describe('WHEN the pane is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onPaneContextMenu(rightClick));
      });

      test('THEN the pane menu opens at the cursor with its flow position', () => {
        expect(harness.current.contextMenu).toEqual({ type: 'pane', x: 40, y: 60, flowX: 10, flowY: 10 });
      });

      test('THEN the browser menu is suppressed and the open overlays close', () => {
        expect(rightClick.defaultPrevented).toBe(true);
        expect(useCanvasStore.getState().openCommentsNodeId).toBeNull();
      });
    });

    describe('WHEN a node is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onNodeContextMenu(rightClick as never, canvasNode('n1')));
      });

      test('THEN the node menu opens at the cursor', () => {
        expect(harness.current.contextMenu).toEqual({ type: 'node', x: 40, y: 60, nodeId: 'n1' });
      });
    });

    describe('WHEN an edge is right-clicked and the menu is then closed', () => {
      beforeEach(() => {
        act(() => harness.current.onEdgeContextMenu(rightClick as never, canvasEdge('e1', 'n1', 'n2')));
        act(() => harness.current.closeContextMenu());
      });

      test('THEN no menu is left open', () => {
        expect(harness.current.contextMenu).toBeNull();
      });
    });

    describe('WHEN an edge is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onEdgeContextMenu(rightClick as never, canvasEdge('e1', 'n1', 'n2')));
      });

      test('THEN the edge menu opens at the cursor', () => {
        expect(harness.current.contextMenu).toEqual({ type: 'edge', x: 40, y: 60, edgeId: 'e1' });
      });
    });
  });

  describe('GIVEN a commenter', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      harness = renderHook(useCanvasContextMenu, { wrapper: ReactFlowProvider }).result;
    });

    describe('WHEN a node is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onNodeContextMenu(rightClick as never, canvasNode('n1')));
      });

      test('THEN the node menu opens for the comment action', () => {
        expect(harness.current.contextMenu).toEqual({ type: 'node', x: 40, y: 60, nodeId: 'n1' });
      });
    });

    describe('WHEN the pane is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onPaneContextMenu(rightClick));
      });

      test('THEN no menu opens but the browser menu is still suppressed and the overlays close', () => {
        expect(harness.current.contextMenu).toBeNull();
        expect(rightClick.defaultPrevented).toBe(true);
        expect(useCanvasStore.getState().openCommentsNodeId).toBeNull();
      });
    });

    describe('WHEN an edge is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onEdgeContextMenu(rightClick as never, canvasEdge('e1', 'n1', 'n2')));
      });

      test('THEN no menu opens', () => {
        expect(harness.current.contextMenu).toBeNull();
        expect(rightClick.defaultPrevented).toBe(true);
      });
    });
  });

  describe('GIVEN a viewer', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      harness = renderHook(useCanvasContextMenu, { wrapper: ReactFlowProvider }).result;
    });

    describe('WHEN a canvas node is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onNodeContextMenu(rightClick as never, canvasNode('n1')));
      });

      test('THEN no menu opens', () => {
        expect(harness.current.contextMenu).toBeNull();
      });
    });

    describe('WHEN a reference is right-clicked', () => {
      beforeEach(() => {
        act(() => harness.current.onNodeContextMenu(rightClick as never, referenceNode('r1')));
      });

      test('THEN the reference menu opens so the source can be visited', () => {
        expect(harness.current.contextMenu).toEqual({ type: 'node', x: 40, y: 60, nodeId: 'r1' });
      });
    });
  });
});
