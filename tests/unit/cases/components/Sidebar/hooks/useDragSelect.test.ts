import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { domRect, stubAnimationFrame } from '@mocks/browser';
import { AUTO_SCROLL_INTERVAL_MS, AUTO_SCROLL_STEP_PX } from '@/components/Sidebar/consts';
import { useDragSelect } from '@/components/Sidebar/hooks';

const onSelectionChange = vi.fn();

let dragSelect: { current: ReturnType<typeof useDragSelect> };
let frames: ReturnType<typeof stubAnimationFrame>;
let scrollParent: HTMLElement;
let container: HTMLElement;
let itemA: HTMLElement;

const createItem = (id: string, top: number, height: number): HTMLElement => {
  const item = document.createElement('div');
  item.setAttribute('data-item-id', id);
  vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(
    domRect({ left: 0, right: 200, top, bottom: top + height, width: 200, height, y: top }),
  );

  return item;
};

const mouseDownAt = (x: number, y: number, button = 0): MouseEvent =>
  new MouseEvent('mousedown', { bubbles: true, button, clientX: x, clientY: y });

const mouseMoveTo = (x: number, y: number): MouseEvent => new MouseEvent('mousemove', { clientX: x, clientY: y });

beforeEach(() => {
  frames = stubAnimationFrame();
  scrollParent = document.createElement('div');
  scrollParent.setAttribute('data-sidebar-scroll', '');
  container = document.createElement('div');
  itemA = createItem('a', 0, 40);
  container.append(itemA, createItem('b', 40, 40), createItem('c', 80, 40), createItem('ghost', 25, 0));
  scrollParent.appendChild(container);
  document.body.appendChild(scrollParent);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('useDragSelect', () => {
  describe('GIVEN a drag select bound to a scrollable sidebar', () => {
    beforeEach(() => {
      dragSelect = renderHook(() => useDragSelect({ containerRef: { current: container }, onSelectionChange })).result;
    });

    describe('WHEN the pointer drags beyond the activation threshold', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN the rectangle normalizes to the pointer extents', () => {
        expect(dragSelect.current.rect).toEqual({ x: 40, y: 20, width: 60, height: 30 });
      });

      test('THEN only the visible overlapping items are selected', () => {
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
        expect(onSelectionChange).toHaveBeenCalledWith(new Set(['a', 'b']));
      });
    });

    describe('WHEN the pointer stays within the activation threshold', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(102, 52));
          frames.flush();
        });
      });

      test('THEN no rectangle appears and nothing is selected', () => {
        expect(dragSelect.current.rect).toBeNull();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the pointer moves twice before a frame flushes', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(110, 60));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN only the latest rectangle applies', () => {
        expect(dragSelect.current.rect).toEqual({ x: 40, y: 20, width: 60, height: 30 });
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN the pointer keeps the same items covered across frames', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
          window.dispatchEvent(mouseMoveTo(45, 25));
          frames.flush();
        });
      });

      test('THEN the rectangle updates without repeating the selection', () => {
        expect(dragSelect.current.rect).toEqual({ x: 45, y: 25, width: 55, height: 25 });
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN the pointer retreats to cover fewer items', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
          window.dispatchEvent(mouseMoveTo(90, 45));
          frames.flush();
        });
      });

      test('THEN the shrunken set is reported', () => {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
        expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['b']));
      });
    });

    describe('WHEN the mouse releases mid-drag', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
          window.dispatchEvent(new MouseEvent('mouseup'));
          window.dispatchEvent(mouseMoveTo(10, 10));
          frames.flush();
        });
      });

      test('THEN the rectangle clears and further movement stays inert', () => {
        expect(dragSelect.current.rect).toBeNull();
        expect(onSelectionChange).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN a second drag covers the same items after a release', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
          window.dispatchEvent(new MouseEvent('mouseup'));
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN the selection is reported anew', () => {
        expect(onSelectionChange).toHaveBeenCalledTimes(2);
        expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['a', 'b']));
      });
    });

    describe('WHEN the drag starts with the right mouse button', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50, 2));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN no selection happens', () => {
        expect(dragSelect.current.rect).toBeNull();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the drag starts on an item', () => {
      beforeEach(() => {
        act(() => {
          itemA.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN no selection happens', () => {
        expect(dragSelect.current.rect).toBeNull();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an armed drag inside a partially scrolled sidebar', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(scrollParent, 'getBoundingClientRect').mockReturnValue(
        domRect({ top: 0, bottom: 300, right: 240, width: 240, height: 300 }),
      );
      Object.defineProperty(scrollParent, 'scrollTop', { configurable: true, writable: true, value: 100 });
      Object.defineProperty(scrollParent, 'scrollHeight', { configurable: true, value: 600 });
      Object.defineProperty(scrollParent, 'clientHeight', { configurable: true, value: 300 });
      dragSelect = renderHook(() => useDragSelect({ containerRef: { current: container }, onSelectionChange })).result;
      act(() => {
        scrollParent.dispatchEvent(mouseDownAt(100, 150));
      });
    });

    describe('WHEN the pointer hovers the top edge zone', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 10));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the sidebar scrolls up step by step', () => {
        expect(scrollParent.scrollTop).toBe(100 - AUTO_SCROLL_STEP_PX * 3);
      });
    });

    describe('WHEN the pointer hovers the bottom edge zone', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 290));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the sidebar scrolls down step by step', () => {
        expect(scrollParent.scrollTop).toBe(100 + AUTO_SCROLL_STEP_PX * 3);
      });
    });

    describe('WHEN the pointer stays between the edge zones', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 155));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the scroll position stays put', () => {
        expect(scrollParent.scrollTop).toBe(100);
      });
    });

    describe('WHEN the pointer leaves the edge zone mid-scroll', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 10));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 2);
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 155));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the scrolling stops at the position reached', () => {
        expect(scrollParent.scrollTop).toBe(100 - AUTO_SCROLL_STEP_PX * 2);
      });
    });

    describe('WHEN the mouse releases mid-scroll', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 10));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 2);
        act(() => {
          window.dispatchEvent(new MouseEvent('mouseup'));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the scrolling stops at the position reached', () => {
        expect(scrollParent.scrollTop).toBe(100 - AUTO_SCROLL_STEP_PX * 2);
      });
    });
  });

  describe('GIVEN an armed drag inside a sidebar with no room to scroll', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(scrollParent, 'getBoundingClientRect').mockReturnValue(
        domRect({ top: 0, bottom: 300, right: 240, width: 240, height: 300 }),
      );
      Object.defineProperty(scrollParent, 'scrollTop', { configurable: true, writable: true, value: 0 });
      Object.defineProperty(scrollParent, 'scrollHeight', { configurable: true, value: 300 });
      Object.defineProperty(scrollParent, 'clientHeight', { configurable: true, value: 300 });
      dragSelect = renderHook(() => useDragSelect({ containerRef: { current: container }, onSelectionChange })).result;
      act(() => {
        scrollParent.dispatchEvent(mouseDownAt(100, 150));
      });
    });

    describe('WHEN the pointer sweeps both edge zones', () => {
      beforeEach(() => {
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 10));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
        act(() => {
          window.dispatchEvent(mouseMoveTo(100, 290));
        });
        vi.advanceTimersByTime(AUTO_SCROLL_INTERVAL_MS * 3);
      });

      test('THEN the scroll position stays put', () => {
        expect(scrollParent.scrollTop).toBe(0);
      });
    });
  });

  describe('GIVEN a sidebar container without a scrollable ancestor', () => {
    beforeEach(() => {
      document.body.appendChild(container);
      dragSelect = renderHook(() => useDragSelect({ containerRef: { current: container }, onSelectionChange })).result;
    });

    describe('WHEN the pointer drags across the items', () => {
      beforeEach(() => {
        act(() => {
          container.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN the selection still works from the container itself', () => {
        expect(dragSelect.current.rect).toEqual({ x: 40, y: 20, width: 60, height: 30 });
        expect(onSelectionChange).toHaveBeenCalledWith(new Set(['a', 'b']));
      });
    });
  });

  describe('GIVEN a disabled drag select', () => {
    beforeEach(() => {
      dragSelect = renderHook(() =>
        useDragSelect({ containerRef: { current: container }, onSelectionChange, enabled: false }),
      ).result;
    });

    describe('WHEN a full drag gesture happens', () => {
      beforeEach(() => {
        act(() => {
          scrollParent.dispatchEvent(mouseDownAt(100, 50));
          window.dispatchEvent(mouseMoveTo(40, 20));
          frames.flush();
        });
      });

      test('THEN nothing reacts', () => {
        expect(dragSelect.current.rect).toBeNull();
        expect(onSelectionChange).not.toHaveBeenCalled();
      });
    });
  });
});
