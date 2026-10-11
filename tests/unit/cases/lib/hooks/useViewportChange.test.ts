import { renderHook, type RenderHookResult } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useViewportChange } from '@hooks';

const onScroll = vi.fn();
const onResize = vi.fn();

const scroller = document.createElement('div');

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

  describe('GIVEN only a resize listener', () => {
    beforeEach(() => {
      renderHook(() => useViewportChange({ onResize }));
    });

    describe('WHEN the window scrolls and resizes', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
      });

      test('THEN only the resize callback fires', () => {
        expect(onResize).toHaveBeenCalledOnce();
        expect(onScroll).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN capture-phase listeners', () => {
    let view: RenderHookResult<void, unknown>;

    beforeEach(() => {
      document.body.append(scroller);
      view = renderHook(() => useViewportChange({ onScroll, onResize, capture: true }));
    });

    afterEach(() => {
      scroller.remove();
    });

    describe('WHEN a scroll container inside the page scrolls', () => {
      beforeEach(() => {
        scroller.dispatchEvent(new Event('scroll'));
      });

      test('THEN the scroll callback fires even though scroll events do not bubble', () => {
        expect(onScroll).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the hook unmounts and then a scroll container scrolls and the window resizes', () => {
      beforeEach(() => {
        view.unmount();
        scroller.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
      });

      test('THEN both capture listeners are gone', () => {
        expect(onScroll).not.toHaveBeenCalled();
        expect(onResize).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN bubble-phase listeners', () => {
    beforeEach(() => {
      document.body.append(scroller);
      renderHook(() => useViewportChange({ onScroll, onResize }));
    });

    afterEach(() => {
      scroller.remove();
    });

    describe('WHEN a scroll container inside the page scrolls', () => {
      beforeEach(() => {
        scroller.dispatchEvent(new Event('scroll'));
      });

      test('THEN only window scrolls reach the callback', () => {
        expect(onScroll).not.toHaveBeenCalled();
      });
    });
  });
});
