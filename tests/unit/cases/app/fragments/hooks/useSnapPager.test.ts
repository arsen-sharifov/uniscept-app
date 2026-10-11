import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { setElementLayout, stubMediaQueries } from '@mocks/browser';
import { landingPager } from '@mocks/landing';
import { SNAP_GESTURE_LOCK_MS, SNAP_HEADER_OFFSET_PX, SNAP_MIN_DELTA_PX } from '@/app/fragments/consts';
import { useSnapPager } from '@/app/fragments/hooks';

const scrollTo = vi.fn();

let pager: ReturnType<typeof landingPager>;
let media: ReturnType<typeof stubMediaQueries>;
let notPrevented: boolean;

beforeEach(() => {
  vi.useFakeTimers();
  media = stubMediaQueries();
  pager = landingPager();
  pager.container.scrollTo = scrollTo;
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useSnapPager', () => {
  describe('GIVEN the first of two screens at the top', () => {
    beforeEach(() => {
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns down', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page glides to the next screen under the header with snapping paused', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - SNAP_HEADER_OFFSET_PX, behavior: 'smooth' });
        expect(pager.container.style.scrollSnapType).toBe('none');
      });
    });

    describe('WHEN the wheel turns down again during the glide', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the second turn is swallowed without another glide', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the glide ends and the wheel turns down again', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        fireEvent(pager.container, new Event('scrollend'));
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the lock is released and the next turn glides again', () => {
        expect(scrollTo).toHaveBeenCalledTimes(2);
        expect(pager.container.style.scrollSnapType).toBe('none');
      });
    });

    describe('WHEN the glide never reports its end', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        act(() => vi.advanceTimersByTime(SNAP_GESTURE_LOCK_MS));
      });

      test('THEN snapping is restored after the gesture lock', () => {
        expect(pager.container.style.scrollSnapType).toBe('');
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('WHEN the wheel turns up on the first screen', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN nothing glides', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the wheel barely moves', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: SNAP_MIN_DELTA_PX - 1 });
      });

      test('THEN the browser scrolls natively', () => {
        expect(notPrevented).toBe(true);
        expect(scrollTo).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the wheel turns with the zoom modifier held', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100, ctrlKey: true });
      });

      test('THEN the browser zooms natively', () => {
        expect(notPrevented).toBe(true);
        expect(scrollTo).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a first screen taller than the viewport', () => {
    beforeEach(() => {
      setElementLayout(pager.container.children[0] as HTMLElement, { offsetHeight: 1400 });
      setElementLayout(pager.container.children[1] as HTMLElement, { offsetTop: 1400 });
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns down with content left inside it', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the browser scrolls through it natively', () => {
        expect(notPrevented).toBe(true);
        expect(scrollTo).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN reduced motion', () => {
    beforeEach(() => {
      media.change(REDUCED_MOTION_QUERY, true);
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns down', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page jumps to the next screen', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - SNAP_HEADER_OFFSET_PX, behavior: 'auto' });
      });
    });
  });

  describe('GIVEN an active section transition', () => {
    beforeEach(() => {
      renderHook(() => useSnapPager(pager.ref));
      fireEvent.wheel(pager.container, { deltaY: 100 });
    });

    describe('WHEN reduced motion is enabled before scrolling settles', () => {
      beforeEach(() => {
        act(() => media.change(REDUCED_MOTION_QUERY, true));
      });

      test('THEN scroll snapping is restored and no timeout remains', () => {
        expect(scrollTo).toHaveBeenCalledOnce();
        expect(pager.container.style.scrollSnapType).toBe('');
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('WHEN the pager unmounts before scrolling settles', () => {
      beforeEach(() => {
        cleanup();
      });

      test('THEN scroll snapping is restored and no timeout remains', () => {
        expect(scrollTo).toHaveBeenCalledOnce();
        expect(pager.container.style.scrollSnapType).toBe('');
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });
});
