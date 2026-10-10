import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubAnimationFrame, stubFontsReady, stubPerformanceNow } from '@mocks/browser';
import { auroraReady } from '@mocks/landingUtils';
import { ARRIVAL_CONTENT_CAP_MS } from '@/app/fragments/consts';
import type { useWorldArrival } from '@/app/fragments/hooks';

vi.mock('@/app/fragments/utils', () => ({ auroraReady }));

let hooks: { useWorldArrival: typeof useWorldArrival };
let frames: ReturnType<typeof stubAnimationFrame>;
let fonts: ReturnType<typeof stubFontsReady>;
let showAurora: () => void;
let arrival: { current: ReturnType<typeof useWorldArrival> };

beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  frames = stubAnimationFrame();
  fonts = stubFontsReady();
  stubPerformanceNow();
  auroraReady.mockReturnValue(
    new Promise<void>((resolve) => {
      showAurora = resolve;
    }),
  );
  hooks = await import('@/app/fragments/hooks');
  arrival = renderHook(() => hooks.useWorldArrival()).result;
});

afterEach(() => {
  fonts.restore();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useWorldArrival', () => {
  describe('GIVEN a landing whose aurora and fonts are still loading', () => {
    describe('WHEN it mounts', () => {
      test('THEN neither the field nor the content has arrived', () => {
        expect(arrival.current).toEqual({ field: false, content: false });
      });
    });

    describe('WHEN the aurora draws its first frame', () => {
      beforeEach(async () => {
        showAurora();
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() => frames.flush());
      });

      test('THEN the field arrives while the content waits for the fonts', () => {
        expect(arrival.current).toEqual({ field: true, content: false });
      });
    });

    describe('WHEN the aurora and the fonts are both ready', () => {
      beforeEach(async () => {
        showAurora();
        fonts.load();
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() => frames.flush());
      });

      test('THEN everything arrives on the next frame and the cap is dropped', () => {
        expect(arrival.current).toEqual({ field: true, content: true });
        expect(vi.getTimerCount()).toBe(0);
      });
    });

    describe('WHEN neither is ready by the content cap', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(ARRIVAL_CONTENT_CAP_MS));
      });

      test('THEN the content arrives anyway while the field keeps waiting', () => {
        expect(arrival.current).toEqual({ field: false, content: true });
      });
    });

    describe('WHEN the landing unmounts before the content arrives', () => {
      beforeEach(() => {
        cleanup();
      });

      test('THEN the content cap is dropped', () => {
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('GIVEN a landing whose content already arrived', () => {
    beforeEach(() => {
      act(() => vi.advanceTimersByTime(ARRIVAL_CONTENT_CAP_MS));
      cleanup();
    });

    describe('WHEN it mounts again', () => {
      beforeEach(() => {
        arrival = renderHook(() => hooks.useWorldArrival()).result;
      });

      test('THEN the content shows at once without a new cap', () => {
        expect(arrival.current.content).toBe(true);
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });
});
