import { act, cleanup, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { stubMediaQueries } from '@mocks/browser';
import {
  COMPACT_HEADER_OFFSET_PX,
  LANDING_HEADER_OFFSET_PX,
  TALL_SCREEN_END_PX,
  TALL_SCREEN_HEIGHT_PX,
  landingPager,
  stretchFirstScreen,
} from '@mocks/landing';
import {
  SNAP_END_PADDING_PX,
  SNAP_GESTURE_LOCK_MS,
  SNAP_MIN_DELTA_PX,
  SNAP_START_PADDING_PX,
  SNAP_WHEEL_QUIET_MS,
} from '@/app/fragments/consts';
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

      test('THEN the page glides to the next screen under the header', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - LANDING_HEADER_OFFSET_PX, behavior: 'smooth' });
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

    describe('WHEN the glide ends while the same gesture keeps sending wheel events', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        fireEvent(pager.container, new Event('scrollend'));
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 40 });
      });

      test('THEN the tail of the gesture is swallowed instead of scrolling again', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN small wheel steps arrive during the glide', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        notPrevented = fireEvent.wheel(pager.container, { deltaY: SNAP_MIN_DELTA_PX - 1 });
      });

      test('THEN they are swallowed so they cannot nudge the page off its target', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the glide ends and the wheel turns down again after a pause', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        fireEvent(pager.container, new Event('scrollend'));
        act(() => vi.advanceTimersByTime(SNAP_WHEEL_QUIET_MS));
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the lock is released and the next turn glides again', () => {
        expect(scrollTo).toHaveBeenCalledTimes(2);
      });
    });

    describe('WHEN the glide never reports its end', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        act(() => vi.advanceTimersByTime(SNAP_GESTURE_LOCK_MS));
      });

      test('THEN the gesture lock is released without a timer left behind', () => {
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

      test('THEN the page stays put instead of drifting', () => {
        expect(notPrevented).toBe(false);
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

    describe('WHEN the touchpad swipes sideways', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaX: -120, deltaY: 6 });
      });

      test('THEN the browser keeps the swipe for going back or forward', () => {
        expect(notPrevented).toBe(true);
        expect(scrollTo).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN the compact header of a short window', () => {
    beforeEach(() => {
      pager.container.style.scrollPaddingTop = `${COMPACT_HEADER_OFFSET_PX}px`;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns down', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the next screen lands under the compact header', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - COMPACT_HEADER_OFFSET_PX, behavior: 'smooth' });
      });
    });
  });

  describe('GIVEN a first screen taller than the viewport', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns down with content left inside it', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page scrolls through it by the length of the turn', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 100, behavior: 'smooth' });
      });
    });

    describe('WHEN a second turn arrives before the first scroll has finished', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN it continues from where the page is heading, not from the stale position', () => {
        expect(scrollTo).toHaveBeenLastCalledWith({ top: 200, behavior: 'smooth' });
      });
    });

    describe('WHEN small touchpad steps move through it', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 20 });
      });

      test('THEN the page follows them without a smoothing delay', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 20, behavior: 'instant' });
      });
    });
  });

  describe('GIVEN a first screen taller than the viewport scrolled to two pixels before its end', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_END_PX - 2;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN a small step reaches just past the end', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 5 });
      });

      test('THEN the page stops at the end of the screen instead of leaving it', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: TALL_SCREEN_END_PX, behavior: 'instant' });
      });
    });
  });

  describe('GIVEN the page left between two screens by a free scroll', () => {
    beforeEach(() => {
      pager.container.scrollTop = 300;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns up', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN the page glides back to the screen it is on instead of skipping it', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, behavior: 'smooth' });
      });
    });

    describe('WHEN the wheel turns down', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page glides on to the next screen', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - LANDING_HEADER_OFFSET_PX, behavior: 'smooth' });
      });
    });
  });

  describe('GIVEN a first screen taller than the viewport scrolled close to its end', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_END_PX - 50;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN a wheel turn would scroll past its end', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page first stops at the end so the rest of the screen is seen', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: TALL_SCREEN_END_PX, behavior: 'smooth' });
      });
    });

    describe('WHEN the same gesture keeps turning the wheel after the stop at the end', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        notPrevented = fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page stays at the end instead of leaving the screen in the same gesture', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the wheel turns again after the stop at the end has settled', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
        act(() => vi.advanceTimersByTime(SNAP_WHEEL_QUIET_MS));
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page glides on to the next screen', () => {
        expect(scrollTo).toHaveBeenLastCalledWith({
          top: TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX,
          behavior: 'smooth',
        });
      });
    });
  });

  describe('GIVEN a first screen taller than the viewport scrolled to within its padding of the end', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_END_PX - SNAP_END_PADDING_PX;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN a wheel turn would scroll past its end', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: 100 });
      });

      test('THEN the page moves straight on to the next screen without a tiny stop at the end', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
          top: TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX,
          behavior: 'smooth',
        });
      });
    });
  });

  describe('GIVEN a second screen scrolled just below its start under a first screen taller than the viewport', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX + 30;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN a wheel turn up would scroll past its start', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN the page first shows the top of the screen it is on', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
          top: TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX,
          behavior: 'instant',
        });
      });
    });
  });

  describe('GIVEN a second screen scrolled within its top padding under a first screen taller than the viewport', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX + SNAP_START_PADDING_PX;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns up', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN the page moves straight to the end of the tall screen above without a tiny stop', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: TALL_SCREEN_END_PX, behavior: 'smooth' });
      });
    });
  });

  describe('GIVEN a second screen at its start under a first screen taller than the viewport', () => {
    beforeEach(() => {
      stretchFirstScreen(pager);
      pager.container.scrollTop = TALL_SCREEN_HEIGHT_PX - LANDING_HEADER_OFFSET_PX;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns up', () => {
      beforeEach(() => {
        fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN the page moves to the end of the tall screen above so it can be scrolled up through', () => {
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: TALL_SCREEN_END_PX, behavior: 'smooth' });
      });
    });
  });

  describe('GIVEN the first screen scrolled just below the top', () => {
    beforeEach(() => {
      pager.container.scrollTop = 30;
      renderHook(() => useSnapPager(pager.ref));
    });

    describe('WHEN the wheel turns up', () => {
      beforeEach(() => {
        notPrevented = fireEvent.wheel(pager.container, { deltaY: -100 });
      });

      test('THEN the page glides to the top', () => {
        expect(notPrevented).toBe(false);
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, behavior: 'smooth' });
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
        expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 600 - LANDING_HEADER_OFFSET_PX, behavior: 'instant' });
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

      test('THEN the running glide is dropped without a timer left behind', () => {
        expect(scrollTo).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('WHEN the pager unmounts before scrolling settles', () => {
      beforeEach(() => {
        cleanup();
      });

      test('THEN no timer is left behind', () => {
        expect(scrollTo).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });
});
