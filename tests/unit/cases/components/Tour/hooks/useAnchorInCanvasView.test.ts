import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { elementAt } from '@mocks/browser';
import { CANVAS_NODE_BELOW_VIEW_RECT, CANVAS_NODE_IN_VIEW_RECT, CANVAS_RECT } from '@mocks/geometry';
import { useAnchorInCanvasView } from '@/components/Tour/hooks';
import { useCanvasStore } from '@/lib/stores';

let fitsBefore: number;

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  useCanvasStore.getState().clearCanvas();
  vi.restoreAllMocks();
});

describe('useAnchorInCanvasView', () => {
  describe('GIVEN a canvas node below the visible part of the canvas', () => {
    beforeEach(() => {
      const canvas = elementAt({ 'data-tour': 'canvas' }, CANVAS_RECT);
      canvas.append(elementAt({ 'data-tour': 'canvasNode' }, CANVAS_NODE_BELOW_VIEW_RECT));
      document.body.append(canvas);
      fitsBefore = useCanvasStore.getState().fitRequest;
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInCanvasView('canvasNode'));
      });

      test('THEN the canvas is asked to fit its content', () => {
        expect(useCanvasStore.getState().fitRequest).toBe(fitsBefore + 1);
      });
    });
  });

  describe('GIVEN a canvas node inside the visible part of the canvas', () => {
    beforeEach(() => {
      const canvas = elementAt({ 'data-tour': 'canvas' }, CANVAS_RECT);
      canvas.append(elementAt({ 'data-tour': 'canvasNode' }, CANVAS_NODE_IN_VIEW_RECT));
      document.body.append(canvas);
      fitsBefore = useCanvasStore.getState().fitRequest;
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInCanvasView('canvasNode'));
      });

      test('THEN the canvas keeps its viewport', () => {
        expect(useCanvasStore.getState().fitRequest).toBe(fitsBefore);
      });
    });
  });

  describe('GIVEN an anchor that is not on screen', () => {
    beforeEach(() => {
      fitsBefore = useCanvasStore.getState().fitRequest;
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInCanvasView('canvasNode'));
      });

      test('THEN the canvas is not asked to fit', () => {
        expect(useCanvasStore.getState().fitRequest).toBe(fitsBefore);
      });
    });
  });
});
