import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useScrollReveal } from '@hooks';
import { stubIntersectionObserver } from '@mocks/browser';

const element = document.createElement('div');

element.setAttribute('data-reveal', '');

beforeEach(() => {
  element.classList.remove('revealed');
  document.body.append(element);
});

afterEach(() => {
  element.remove();
  vi.unstubAllGlobals();
});

describe('useScrollReveal', () => {
  describe('GIVEN a revealable element on the page', () => {
    describe('WHEN the hook mounts', () => {
      test('THEN the element is observed', () => {
        const observer = stubIntersectionObserver();

        renderHook(() => useScrollReveal());

        expect(observer.observe).toHaveBeenCalledExactlyOnceWith(element);
      });
    });

    describe('WHEN the element intersects the viewport', () => {
      test('THEN it is revealed and released from observation', () => {
        const observer = stubIntersectionObserver();

        renderHook(() => useScrollReveal());
        act(() => observer.intersect([element]));

        expect(element.classList.contains('revealed')).toBe(true);
        expect(observer.unobserve).toHaveBeenCalledExactlyOnceWith(element);
      });
    });

    describe('WHEN the element passes by without intersecting', () => {
      test('THEN it stays hidden and observed', () => {
        const observer = stubIntersectionObserver();

        renderHook(() => useScrollReveal());
        act(() => observer.intersect([element], false));

        expect(element.classList.contains('revealed')).toBe(false);
        expect(observer.unobserve).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the hook unmounts', () => {
      test('THEN the observer disconnects', () => {
        const observer = stubIntersectionObserver();

        renderHook(() => useScrollReveal()).unmount();

        expect(observer.disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
