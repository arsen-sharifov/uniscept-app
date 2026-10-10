import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { stubMediaQueries } from '@mocks/browser';
import { VIGNETTE_INTERVAL_MS } from '@mocks/landing';
import { useVignettePhase } from '@/app/fragments/hooks';

let media: ReturnType<typeof stubMediaQueries>;
let phase: { current: number };

beforeEach(() => {
  vi.useFakeTimers();
  media = stubMediaQueries();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useVignettePhase', () => {
  describe('GIVEN a three phase vignette', () => {
    beforeEach(() => {
      phase = renderHook(() => useVignettePhase(3, VIGNETTE_INTERVAL_MS)).result;
    });

    describe('WHEN two intervals pass', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(VIGNETTE_INTERVAL_MS * 2));
      });

      test('THEN it shows the third phase', () => {
        expect(phase.current).toBe(2);
      });
    });

    describe('WHEN a full cycle passes', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(VIGNETTE_INTERVAL_MS * 3));
      });

      test('THEN it wraps around to the first phase', () => {
        expect(phase.current).toBe(0);
      });
    });

    describe('WHEN reduced motion is enabled during playback', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(VIGNETTE_INTERVAL_MS));
        act(() => media.change(REDUCED_MOTION_QUERY, true));
      });

      test('THEN the phase holds and its timer stops', () => {
        expect(phase.current).toBe(1);
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('GIVEN reduced motion before the vignette mounts', () => {
    beforeEach(() => {
      media.change(REDUCED_MOTION_QUERY, true);
    });

    describe('WHEN intervals pass', () => {
      beforeEach(() => {
        phase = renderHook(() => useVignettePhase(3, VIGNETTE_INTERVAL_MS)).result;
        act(() => vi.advanceTimersByTime(VIGNETTE_INTERVAL_MS * 2));
      });

      test('THEN it stays on the first phase', () => {
        expect(phase.current).toBe(0);
      });
    });
  });
});
