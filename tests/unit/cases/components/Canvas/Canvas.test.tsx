import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { type Edge, ReactFlowProvider, useEdges } from '@xyflow/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getCanvasContent } from '@api/client';
import { stubAnimationFrame, stubMediaQueries, stubResizeObserver } from '@mocks/browser';
import { THREAD_ID, canvasEdge, canvasNode } from '@mocks/canvas';
import { event } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { PRELOAD_ERROR } from '@mocks/richTextEditor';
import { EDIT_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { Canvas } from '@/components/Canvas';
import { OPEN_COMMENTS_Z_INDEX } from '@/components/Canvas/consts';
import { preloadRichTextEditor } from '@/components/RichTextEditor';
import { resetQueue } from '@/lib/canvas';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@api/client', () => import('@mocks/canvasApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));
vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/components/RichTextEditor', () => import('@mocks/richTextEditor'));

const flowPane = () => document.querySelector('.react-flow__pane') as HTMLElement;

let flowEdges: { current: Edge[] };

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
  describe('GIVEN the store still holds the graph of the previous thread', () => {
    beforeEach(() => {
      vi.mocked(getCanvasContent).mockReturnValue(new Promise(() => {}));
      useCanvasStore.getState().loadCanvas('thread-old', { nodes: [canvasNode('old')], edges: [], authors: {} });
    });

    describe('WHEN the canvas renders the next thread', () => {
      beforeEach(() => {
        render(
          <ReactFlowProvider>
            <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
          </ReactFlowProvider>,
        );
      });

      test('THEN the previous graph stays off screen', () => {
        expect(screen.queryByText('Node old')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a canvas whose load failed', () => {
    beforeEach(async () => {
      vi.mocked(getCanvasContent).mockRejectedValueOnce(new Error('load failed'));
      render(
        <ReactFlowProvider>
          <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
        </ReactFlowProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the user retries after the backend recovers', () => {
      beforeEach(async () => {
        vi.mocked(getCanvasContent).mockResolvedValueOnce({ nodes: [canvasNode('back')], edges: [], authors: {} });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.loadError.retry }));
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the canvas loads and the error leaves', () => {
        expect(screen.getByText('Node back')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an editor on a loaded canvas with two nodes', () => {
    beforeEach(async () => {
      vi.mocked(getCanvasContent).mockResolvedValue({
        nodes: [canvasNode('a'), canvasNode('b')],
        edges: [],
        authors: {},
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

    describe('WHEN the canvas has loaded', () => {
      test('THEN the text editor is fetched ahead of the first edit', () => {
        expect(preloadRichTextEditor).toHaveBeenCalled();
      });
    });

    describe('WHEN Escape is pressed while a connection waits for its target', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().setPendingConnection('a'));
        fireEvent.keyDown(window, { key: 'Escape' });
      });

      test('THEN the pending connection is dropped', () => {
        expect(useCanvasStore.getState().pendingConnection).toBeNull();
      });
    });

    describe('WHEN the comments of a node open', () => {
      beforeEach(() => {
        act(() => useCanvasStore.getState().setOpenCommentsNodeId('a'));
      });

      test('THEN that node is raised above the others', () => {
        expect(screen.getByText('Node a').closest('[aria-roledescription="node"]')).toHaveStyle({
          zIndex: String(OPEN_COMMENTS_Z_INDEX),
        });
        expect(screen.getByText('Node b').closest('[aria-roledescription="node"]')).not.toHaveStyle({
          zIndex: String(OPEN_COMMENTS_Z_INDEX),
        });
      });
    });

    describe('WHEN the pane is right-clicked', () => {
      beforeEach(() => {
        fireEvent.contextMenu(flowPane(), { clientX: 120, clientY: 80 });
      });

      test('THEN the pane menu opens at the cursor', () => {
        expect(screen.getByRole('menu', { name: TRANSLATIONS.platform.canvas.context.ariaLabel })).toHaveStyle({
          left: '120px',
          top: '80px',
        });
      });
    });

    describe('WHEN the pane is clicked with the menu and the comments open', () => {
      beforeEach(() => {
        fireEvent.contextMenu(flowPane(), { clientX: 120, clientY: 80 });
        act(() => useCanvasStore.getState().setOpenCommentsNodeId('a'));
        fireEvent.pointerDown(flowPane(), { button: 0, isPrimary: true, clientX: 5, clientY: 5 });
        fireEvent.pointerUp(flowPane(), { button: 0, isPrimary: true, clientX: 5, clientY: 5 });
      });

      test('THEN the menu and the comments close', () => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(useCanvasStore.getState().openCommentsNodeId).toBeNull();
      });
    });
  });

  describe('GIVEN an editor whose editor preload fails', () => {
    beforeEach(async () => {
      vi.mocked(preloadRichTextEditor).mockRejectedValue(PRELOAD_ERROR);
      vi.mocked(getCanvasContent).mockResolvedValue({ nodes: [canvasNode('a')], edges: [], authors: {} });
      render(
        <ReactFlowProvider>
          <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
        </ReactFlowProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the canvas has loaded', () => {
      test('THEN the failure is logged quietly and the canvas stays usable', () => {
        expect(event.error).toHaveBeenCalledWith(PRELOAD_ERROR, { toast: false, context: 'richText.preload' });
        expect(screen.getByText('Node a')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a viewer who can neither edit nor comment', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      vi.mocked(getCanvasContent).mockResolvedValue({ nodes: [canvasNode('a')], edges: [], authors: {} });
      render(
        <ReactFlowProvider>
          <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
        </ReactFlowProvider>,
      );
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the canvas has loaded', () => {
      test('THEN the text editor is never fetched', () => {
        expect(preloadRichTextEditor).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a refuted node in a bidirectional pair that also points on to a third node', () => {
    beforeEach(() => {
      vi.mocked(getCanvasContent).mockResolvedValue({
        nodes: [canvasNode('a'), canvasNode('b', { status: 'invalid' }), canvasNode('c')],
        edges: [canvasEdge('ab', 'a', 'b'), canvasEdge('ba', 'b', 'a'), canvasEdge('ac', 'a', 'c')],
        authors: {},
      });
      flowEdges = renderHook(useEdges, {
        wrapper: ({ children }: { children: ReactNode }) => (
          <ReactFlowProvider>
            <Canvas workspaceId="ws-1" threadId={THREAD_ID} />
            {children}
          </ReactFlowProvider>
        ),
      }).result;
    });

    describe('WHEN the canvas loads', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the pair is drawn once as a bidirectional edge in the stronger of its two tones', () => {
        expect(flowEdges.current).toEqual([
          expect.objectContaining({
            id: 'ab',
            className: 'edge-tone-invalid edge-bidirectional',
            data: expect.objectContaining({ tone: 'invalid', bidirectional: true }),
          }),
          expect.objectContaining({
            id: 'ac',
            className: 'edge-tone-tainted',
            data: expect.objectContaining({ tone: 'tainted', bidirectional: false }),
          }),
        ]);
      });
    });
  });
});
