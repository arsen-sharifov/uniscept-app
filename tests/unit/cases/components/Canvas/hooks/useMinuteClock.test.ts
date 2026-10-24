import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AUTHORSHIP_NOW, IDLE_CLOCK_TICKS } from '@mocks/canvas';
import { CLOCK_TICK_MS } from '@/components/Canvas/consts';
import { useMinuteClock } from '@/components/Canvas/hooks';

const onRender = vi.fn();

let intervalStops: ReturnType<typeof vi.spyOn>;
let intervalStarts: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ now: new Date(AUTHORSHIP_NOW) });
  intervalStarts = vi.spyOn(window, 'setInterval');
  intervalStops = vi.spyOn(window, 'clearInterval');
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useMinuteClock', () => {
  describe('GIVEN two components reading the clock', () => {
    let first: { current: number };
    let second: { current: number };
    let unmountFirst: () => void;

    beforeEach(() => {
      const firstView = renderHook(() => useMinuteClock());
      first = firstView.result;
      unmountFirst = firstView.unmount;
      second = renderHook(() => useMinuteClock()).result;
    });

    describe('WHEN they render', () => {
      test('THEN both read the current time from one shared timer', () => {
        expect(first.current).toBe(Date.parse(AUTHORSHIP_NOW));
        expect(second.current).toBe(Date.parse(AUTHORSHIP_NOW));
        expect(intervalStarts).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN a minute passes', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(CLOCK_TICK_MS));
      });

      test('THEN the time moves on by a minute for both', () => {
        expect(first.current).toBe(Date.parse(AUTHORSHIP_NOW) + CLOCK_TICK_MS);
        expect(second.current).toBe(Date.parse(AUTHORSHIP_NOW) + CLOCK_TICK_MS);
      });
    });

    describe('WHEN only one of them unmounts', () => {
      beforeEach(() => {
        unmountFirst();
      });

      test('THEN the shared timer keeps running', () => {
        expect(intervalStops).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a single component reading the clock', () => {
    describe('WHEN it unmounts', () => {
      beforeEach(() => {
        renderHook(() => useMinuteClock()).unmount();
      });

      test('THEN the timer stops', () => {
        expect(intervalStops).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a clock nobody read for a while', () => {
    beforeEach(() => {
      renderHook(() => useMinuteClock()).unmount();
      vi.advanceTimersByTime(IDLE_CLOCK_TICKS * CLOCK_TICK_MS);
    });

    describe('WHEN a component starts reading it', () => {
      beforeEach(() => {
        renderHook(() => onRender(useMinuteClock()));
      });

      test('THEN it renders once, already showing the current time', () => {
        expect(onRender).toHaveBeenCalledOnce();
        expect(onRender).toHaveBeenCalledWith(Date.parse(AUTHORSHIP_NOW) + IDLE_CLOCK_TICKS * CLOCK_TICK_MS);
      });
    });
  });
});
