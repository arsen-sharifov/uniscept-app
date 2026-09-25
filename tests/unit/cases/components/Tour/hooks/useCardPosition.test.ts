import { act, renderHook, type RenderHookResult } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IAnchorRect } from '@interfaces';

import { setElementLayout, stubResizeObserver } from '@mocks/browser';
import { useCardPosition } from '@/components/Tour/hooks';

const RECT: IAnchorRect = { top: 400, left: 700, width: 120, height: 40 };

let observer: ReturnType<typeof stubResizeObserver>;
let cardRef: RefObject<HTMLElement | null>;
let view: RenderHookResult<ReturnType<typeof useCardPosition>, { rect: IAnchorRect | null }>;

beforeEach(() => {
  observer = stubResizeObserver();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useCardPosition', () => {
  describe('GIVEN a 300 by 160 card for a step placed right of its anchor', () => {
    beforeEach(() => {
      const card = document.createElement('div');
      setElementLayout(card, { offsetWidth: 300, offsetHeight: 160 });
      cardRef = { current: card };
    });

    describe('WHEN it renders before the card has been measured', () => {
      beforeEach(() => {
        view = renderHook(({ rect }: { rect: IAnchorRect | null }) => useCardPosition(cardRef, rect, 'right'), {
          initialProps: { rect: RECT as IAnchorRect | null },
        });
      });

      test('THEN it reports no measurement and waits in the unanchored spot', () => {
        expect(view.result.current).toEqual({ left: 720, top: 846, measured: false });
      });
    });

    describe('WHEN the card reports its size', () => {
      beforeEach(() => {
        view = renderHook(({ rect }: { rect: IAnchorRect | null }) => useCardPosition(cardRef, rect, 'right'), {
          initialProps: { rect: RECT as IAnchorRect | null },
        });
        act(() => observer.resize());
      });

      test('THEN the card sits right of the anchor, centered on it', () => {
        expect(view.result.current).toEqual({ left: 838, top: 340, measured: true });
      });
    });
  });

  describe('GIVEN a measured card right of its anchor', () => {
    beforeEach(() => {
      const card = document.createElement('div');
      setElementLayout(card, { offsetWidth: 300, offsetHeight: 160 });
      cardRef = { current: card };
      view = renderHook(({ rect }: { rect: IAnchorRect | null }) => useCardPosition(cardRef, rect, 'right'), {
        initialProps: { rect: RECT as IAnchorRect | null },
      });
      act(() => observer.resize());
    });

    describe('WHEN the anchor moves up', () => {
      beforeEach(() => {
        view.rerender({ rect: { ...RECT, top: 200 } });
      });

      test('THEN the card follows it', () => {
        expect(view.result.current).toEqual({ left: 838, top: 140, measured: true });
      });
    });

    describe('WHEN the anchor is gone', () => {
      beforeEach(() => {
        view.rerender({ rect: null });
      });

      test('THEN the card drops to the bottom center of the window', () => {
        expect(view.result.current).toEqual({ left: 570, top: 686, measured: true });
      });
    });

    describe('WHEN the window narrows until the right side has no room', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
      });

      test('THEN the card flips to the left of the anchor', () => {
        expect(view.result.current).toEqual({ left: 382, top: 340, measured: true });
      });
    });

    describe('WHEN the card unmounts', () => {
      beforeEach(() => {
        view.unmount();
      });

      test('THEN its size is no longer observed', () => {
        expect(observer.disconnect).toHaveBeenCalledOnce();
      });
    });
  });
});
