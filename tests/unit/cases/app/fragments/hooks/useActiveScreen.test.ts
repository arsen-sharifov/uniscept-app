import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubIntersectionObserver } from '@mocks/browser';
import { landingPager } from '@mocks/landing';
import { useActiveScreen } from '@/app/fragments/hooks';

let visibility: ReturnType<typeof stubIntersectionObserver>;
let pager: ReturnType<typeof landingPager>;
let activeIndex: { current: number };

const secondScreen = () => pager.container.children[1]!;

beforeEach(() => {
  visibility = stubIntersectionObserver();
  pager = landingPager();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useActiveScreen', () => {
  describe('GIVEN the landing screens with the first one active', () => {
    beforeEach(() => {
      activeIndex = renderHook(() => useActiveScreen(pager.ref)).result;
    });

    describe('WHEN the second screen comes into view', () => {
      beforeEach(() => {
        act(() => visibility.intersect(secondScreen()));
      });

      test('THEN it becomes the active screen and reveals its content', () => {
        expect(activeIndex.current).toBe(1);
        expect(secondScreen()).toHaveClass('on-screen');
      });
    });

    describe('WHEN the second screen comes into view and leaves again', () => {
      beforeEach(() => {
        act(() => visibility.intersect(secondScreen()));
        act(() => visibility.leave(secondScreen()));
      });

      test('THEN it stays the last active screen but hides its content', () => {
        expect(activeIndex.current).toBe(1);
        expect(secondScreen()).not.toHaveClass('on-screen');
      });
    });
  });
});
