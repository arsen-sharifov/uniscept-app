import { cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { elementAt, rectAt, scrollerAt, stubMediaQueries, stubScrollIntoView } from '@mocks/browser';
import {
  CANVAS_NODE_BELOW_VIEW_RECT,
  CANVAS_RECT,
  SIDEBAR_ANCHOR_BELOW_WINDOW_RECT,
  SIDEBAR_ANCHOR_IN_WINDOW_RECT,
  TOOL_BELOW_RAIL_RECT,
  TOOL_IN_RAIL_RECT,
  TOOL_RAIL_RECT,
} from '@mocks/geometry';
import { useAnchorInView } from '@/components/Tour/hooks';
import { useCanvasStore } from '@/lib/stores';

let fitsBefore: number;
let media: ReturnType<typeof stubMediaQueries>;
let scrollIntoView: ReturnType<typeof stubScrollIntoView>;
let tool: HTMLElement;

beforeEach(() => {
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  media = stubMediaQueries();
  scrollIntoView = stubScrollIntoView();
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  useCanvasStore.getState().clearCanvas();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useAnchorInView', () => {
  describe('GIVEN a canvas node below the visible part of the canvas', () => {
    beforeEach(() => {
      const canvas = elementAt({ 'data-tour': 'canvas' }, CANVAS_RECT);
      canvas.append(elementAt({ 'data-tour': 'canvasNode' }, CANVAS_NODE_BELOW_VIEW_RECT));
      document.body.append(canvas);
      fitsBefore = useCanvasStore.getState().fitRequest;
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('canvasNode'));
      });

      test('THEN the page does not scroll and the canvas keeps its viewport', () => {
        expect(scrollIntoView).not.toHaveBeenCalled();
        expect(useCanvasStore.getState().fitRequest).toBe(fitsBefore);
      });
    });
  });

  describe('GIVEN a sidebar anchor below the bottom of the window', () => {
    beforeEach(() => {
      document.body.append(elementAt({ 'data-tour': 'sidebarThreadResolved' }, SIDEBAR_ANCHOR_BELOW_WINDOW_RECT));
      fitsBefore = useCanvasStore.getState().fitRequest;
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('sidebarThreadResolved'));
      });

      test('THEN it is scrolled smoothly into view by the nearest edge and the canvas is left alone', () => {
        expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', behavior: 'smooth' });
        expect(useCanvasStore.getState().fitRequest).toBe(fitsBefore);
      });
    });
  });

  describe('GIVEN a sidebar anchor below the bottom of the window and a user who prefers reduced motion', () => {
    beforeEach(() => {
      media.change(REDUCED_MOTION_QUERY, true);
      document.body.append(elementAt({ 'data-tour': 'sidebarThreadResolved' }, SIDEBAR_ANCHOR_BELOW_WINDOW_RECT));
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('sidebarThreadResolved'));
      });

      test('THEN it jumps into view without the smooth scroll animation', () => {
        expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', behavior: 'instant' });
      });
    });
  });

  describe('GIVEN a sidebar anchor inside the window', () => {
    beforeEach(() => {
      document.body.append(elementAt({ 'data-tour': 'sidebarThreadResolved' }, SIDEBAR_ANCHOR_IN_WINDOW_RECT));
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('sidebarThreadResolved'));
      });

      test('THEN nothing scrolls', () => {
        expect(scrollIntoView).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a toolbar tool inside the window but below the visible part of its scrolling rail', () => {
    beforeEach(() => {
      document.body.append(
        scrollerAt(TOOL_RAIL_RECT, elementAt({ 'data-tour': 'toolbarCrossReference' }, TOOL_BELOW_RAIL_RECT)),
      );
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('toolbarCrossReference'));
      });

      test('THEN the rail scrolls it into view by the nearest edge', () => {
        expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', behavior: 'smooth' });
      });
    });
  });

  describe('GIVEN a toolbar tool shown inside its scrolling rail', () => {
    beforeEach(() => {
      tool = elementAt({ 'data-tour': 'toolbarCrossReference' }, TOOL_IN_RAIL_RECT);
      document.body.append(scrollerAt(TOOL_RAIL_RECT, tool));
    });

    describe('WHEN a step points at it', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('toolbarCrossReference'));
      });

      test('THEN nothing scrolls', () => {
        expect(scrollIntoView).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a step points at it and a window resize leaves it below the visible part of the rail', () => {
      beforeEach(() => {
        renderHook(() => useAnchorInView('toolbarCrossReference'));
        vi.mocked(tool.getBoundingClientRect).mockReturnValue(rectAt(TOOL_BELOW_RAIL_RECT));
        fireEvent(window, new Event('resize'));
      });

      test('THEN the rail scrolls it back into view', () => {
        expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'nearest', behavior: 'smooth' });
      });
    });
  });
});
