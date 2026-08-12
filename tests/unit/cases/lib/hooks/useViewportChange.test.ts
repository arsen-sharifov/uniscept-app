import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';

import { useViewportChange } from '@hooks';

const onScroll = vi.fn();
const onResize = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useViewportChange', () => {
  describe('GIVEN listeners for scroll and resize', () => {
    beforeEach(() => {
      renderHook(() => useViewportChange({ onScroll, onResize }));
    });

    describe('WHEN the window scrolls', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      test('THEN the scroll callback fires', () => {
        expect(onScroll).toHaveBeenCalledTimes(1);
        expect(onResize).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the window resizes', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('resize'));
      });

      test('THEN the resize callback fires', () => {
        expect(onResize).toHaveBeenCalledTimes(1);
        expect(onScroll).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a disabled hook', () => {
    beforeEach(() => {
      renderHook(() => useViewportChange({ onScroll, onResize, enabled: false }));
    });

    describe('WHEN the window scrolls and resizes', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
      });

      test('THEN no callback fires', () => {
        expect(onScroll).not.toHaveBeenCalled();
        expect(onResize).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an unmounted hook', () => {
    beforeEach(() => {
      renderHook(() => useViewportChange({ onScroll, onResize })).unmount();
    });

    describe('WHEN the window scrolls and resizes', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
      });

      test('THEN no callback fires', () => {
        expect(onScroll).not.toHaveBeenCalled();
        expect(onResize).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a hook without callbacks', () => {
    let addListener: MockInstance<typeof window.addEventListener>;

    describe('WHEN it mounts', () => {
      beforeEach(() => {
        addListener = vi.spyOn(window, 'addEventListener');
        renderHook(() => useViewportChange({}));
      });

      test('THEN no viewport listener registers', () => {
        expect(addListener.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize')).toEqual([]);
      });
    });
  });

  describe('GIVEN capture-phase listeners', () => {
    let addListener: MockInstance<typeof window.addEventListener>;

    describe('WHEN the hook mounts', () => {
      beforeEach(() => {
        addListener = vi.spyOn(window, 'addEventListener');
        renderHook(() => useViewportChange({ onScroll, onResize, capture: true }));
      });

      test('THEN the listeners register in the capture phase', () => {
        expect(addListener).toHaveBeenCalledWith('scroll', onScroll, true);
        expect(addListener).toHaveBeenCalledWith('resize', onResize, true);
      });
    });

    describe('WHEN the hook unmounts', () => {
      let removeListener: MockInstance<typeof window.removeEventListener>;

      beforeEach(() => {
        removeListener = vi.spyOn(window, 'removeEventListener');
        renderHook(() => useViewportChange({ onScroll, onResize, capture: true })).unmount();
      });

      test('THEN the listeners are removed with the same capture flag', () => {
        expect(removeListener).toHaveBeenCalledWith('scroll', onScroll, true);
        expect(removeListener).toHaveBeenCalledWith('resize', onResize, true);
      });
    });
  });
});
