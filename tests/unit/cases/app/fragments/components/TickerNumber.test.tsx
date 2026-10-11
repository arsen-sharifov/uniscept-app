import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { stubAnimationFrame, stubIntersectionObserver, stubMediaQueries, stubPerformanceNow } from '@mocks/browser';
import { TickerNumber } from '@/app/fragments/components';
import { TICKER_DURATION_MS } from '@/app/fragments/consts';

let frames: ReturnType<typeof stubAnimationFrame>;
let visibility: ReturnType<typeof stubIntersectionObserver>;
let media: ReturnType<typeof stubMediaQueries>;

beforeEach(() => {
  frames = stubAnimationFrame();
  visibility = stubIntersectionObserver();
  media = stubMediaQueries();
  stubPerformanceNow();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('TickerNumber', () => {
  describe('GIVEN a visible price with an active animation', () => {
    beforeEach(() => {
      render(<TickerNumber value={100} />);
      act(() => visibility.intersect());
    });

    describe('WHEN half of the count-up has run', () => {
      beforeEach(() => {
        act(() => frames.flush(TICKER_DURATION_MS / 2));
      });

      test('THEN the price has eased most of the way up and keeps counting', () => {
        expect(screen.getByText('88')).toBeInTheDocument();
        expect(frames.pending()).toBe(1);
      });
    });

    describe('WHEN the whole count-up has run', () => {
      beforeEach(() => {
        act(() => frames.flush(TICKER_DURATION_MS));
      });

      test('THEN the final price shows and counting stops', () => {
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(frames.pending()).toBe(0);
      });
    });

    describe('WHEN its card unmounts', () => {
      beforeEach(() => {
        cleanup();
      });

      test('THEN no animation work remains scheduled', () => {
        expect(frames.pending()).toBe(0);
      });
    });

    describe('WHEN reduced motion is enabled', () => {
      beforeEach(() => {
        act(() => media.change(REDUCED_MOTION_QUERY, true));
      });

      test('THEN the final price is displayed immediately and animation stops', () => {
        expect(screen.getByText('100')).toBeVisible();
        expect(frames.pending()).toBe(0);
      });
    });
  });

  describe('GIVEN reduced motion is enabled', () => {
    beforeEach(() => {
      media.change(REDUCED_MOTION_QUERY, true);
    });

    describe('WHEN the price changes', () => {
      beforeEach(() => {
        const { rerender } = render(<TickerNumber value={100} />);
        rerender(<TickerNumber value={200} />);
      });

      test('THEN the current price is displayed without scheduling animation', () => {
        expect(screen.getByText('200')).toBeVisible();
        expect(frames.pending()).toBe(0);
      });
    });
  });
});
