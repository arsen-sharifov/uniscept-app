import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { DEFAULT_PREFERENCES } from '@constants';
import { useCanvasPattern } from '@/components/Canvas/hooks';

afterEach(() => {
  document.documentElement.removeAttribute('data-canvas-pattern');
});

describe('useCanvasPattern', () => {
  describe('GIVEN a pattern attribute on the root element', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the pattern mirrors the attribute', () => {
        document.documentElement.setAttribute('data-canvas-pattern', 'cross');

        const { result } = renderHook(() => useCanvasPattern());

        expect(result.current).toBe('cross');
      });
    });
  });

  describe('GIVEN an unknown pattern attribute', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the pattern falls back to the default', () => {
        document.documentElement.setAttribute('data-canvas-pattern', 'zebra');

        const { result } = renderHook(() => useCanvasPattern());

        expect(result.current).toBe(DEFAULT_PREFERENCES.canvasPattern);
      });
    });
  });

  describe('GIVEN no pattern attribute', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the default applies', () => {
        const { result } = renderHook(() => useCanvasPattern());

        expect(result.current).toBe(DEFAULT_PREFERENCES.canvasPattern);
      });
    });
  });

  describe('GIVEN a rendered hook', () => {
    describe('WHEN the attribute changes afterwards', () => {
      test('THEN the pattern updates through the mutation observer', async () => {
        const { result } = renderHook(() => useCanvasPattern());

        document.documentElement.setAttribute('data-canvas-pattern', 'lines');

        await waitFor(() => {
          expect(result.current).toBe('lines');
        });
      });
    });
  });

  describe('GIVEN two mounted hooks', () => {
    describe('WHEN both unmount', () => {
      test('THEN the observer disconnects only after the last subscriber leaves', () => {
        const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
        const first = renderHook(() => useCanvasPattern());
        const second = renderHook(() => useCanvasPattern());

        first.unmount();

        expect(disconnect).not.toHaveBeenCalled();

        second.unmount();

        expect(disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
