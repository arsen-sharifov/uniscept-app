import { act, fireEvent, render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { deleteCanvasEdge, deleteCanvasNode, getCanvasContent } from '@api/client';
import { stubAnimationFrame, stubMediaQueries, stubResizeObserver } from '@mocks/browser';
import { THREAD_ID, canvasEdge, canvasNode } from '@mocks/canvas';
import { EDIT_ACCESS } from '@mocks/roles';
import { Canvas } from '@/components/Canvas';
import { FLUSH_DEBOUNCE_MS, resetQueue } from '@/lib/canvas';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@api/client', () => import('@mocks/canvasApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));
vi.mock('next/navigation', () => import('@mocks/navigation'));

const storedIds = () => ({
  nodes: useCanvasStore.getState().nodes.map((node) => node.id),
  edges: useCanvasStore.getState().edges.map((edge) => edge.id),
});

beforeEach(() => {
  vi.useFakeTimers();
  stubResizeObserver();
  stubMediaQueries();
  stubAnimationFrame();
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', EDIT_ACCESS);
});

afterEach(() => {
  resetQueue();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Canvas', () => {
  describe('GIVEN an editor whose selected node is joined to another node', () => {
    beforeEach(async () => {
      vi.mocked(getCanvasContent).mockResolvedValue({
        nodes: [
          { ...canvasNode('own', { createdBy: 'user-1' }), selected: true },
          canvasNode('other', { createdBy: 'user-1' }),
        ],
        edges: [canvasEdge('e1', 'own', 'other')],
      });
      render(
        <ReactFlowProvider>
          <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
        </ReactFlowProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the Delete key is pressed', () => {
      beforeEach(async () => {
        fireEvent.keyDown(document.body, { key: 'Delete' });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        });
        fireEvent.keyUp(document.body, { key: 'Delete' });
      });

      test('THEN the node and its edge leave through the store and only the node delete is sent', () => {
        expect(storedIds()).toEqual({ nodes: ['other'], edges: [] });
        expect(deleteCanvasNode).toHaveBeenCalledExactlyOnceWith('own');
        expect(deleteCanvasEdge).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the Delete key is pressed and the deletion is undone once', () => {
      beforeEach(async () => {
        fireEvent.keyDown(document.body, { key: 'Delete' });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        fireEvent.keyUp(document.body, { key: 'Delete' });
        act(() => useCanvasStore.getState().undo());
      });

      test('THEN the node and its edge come back in one step', () => {
        expect(storedIds()).toEqual({ nodes: ['own', 'other'], edges: ['e1'] });
      });
    });
  });

  describe('GIVEN an editor with a selected edge between two nodes', () => {
    beforeEach(async () => {
      vi.mocked(getCanvasContent).mockResolvedValue({
        nodes: [canvasNode('a', { createdBy: 'user-1' }), canvasNode('b', { createdBy: 'user-1' })],
        edges: [{ ...canvasEdge('e1', 'a', 'b'), selected: true }],
      });
      render(
        <ReactFlowProvider>
          <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
        </ReactFlowProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the Delete key is pressed', () => {
      beforeEach(async () => {
        fireEvent.keyDown(document.body, { key: 'Delete' });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        });
        fireEvent.keyUp(document.body, { key: 'Delete' });
      });

      test('THEN only the edge leaves and its delete is sent', () => {
        expect(storedIds()).toEqual({ nodes: ['a', 'b'], edges: [] });
        expect(deleteCanvasEdge).toHaveBeenCalledExactlyOnceWith('e1');
        expect(deleteCanvasNode).not.toHaveBeenCalled();
      });
    });
  });
});
