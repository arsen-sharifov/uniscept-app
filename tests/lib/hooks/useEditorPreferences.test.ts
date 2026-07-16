import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useEditorPreferences } from '@hooks';

afterEach(() => {
  ['data-snap-to-grid', 'data-default-zoom', 'data-smart-guides'].forEach((attribute) =>
    document.documentElement.removeAttribute(attribute),
  );
});

describe('useEditorPreferences', () => {
  describe('GIVEN editor attributes on the root element', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the snapshot mirrors the attributes', () => {
        document.documentElement.setAttribute('data-snap-to-grid', 'true');
        document.documentElement.setAttribute('data-default-zoom', '125');
        document.documentElement.setAttribute('data-smart-guides', 'false');

        const { result } = renderHook(() => useEditorPreferences());

        expect(result.current).toEqual({ snapToGrid: true, defaultZoom: 125, smartGuides: false });
      });
    });
  });

  describe('GIVEN an invalid zoom attribute', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the zoom falls back to the default', () => {
        document.documentElement.setAttribute('data-default-zoom', '999');

        const { result } = renderHook(() => useEditorPreferences());

        expect(result.current.defaultZoom).toBe(100);
      });
    });
  });

  describe('GIVEN no editor attributes', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the defaults apply', () => {
        const { result } = renderHook(() => useEditorPreferences());

        expect(result.current).toEqual({ snapToGrid: false, defaultZoom: 100, smartGuides: true });
      });
    });
  });

  describe('GIVEN a rendered hook', () => {
    describe('WHEN an attribute changes afterwards', () => {
      test('THEN the snapshot updates through the mutation observer', async () => {
        const { result } = renderHook(() => useEditorPreferences());

        document.documentElement.setAttribute('data-snap-to-grid', 'true');

        await waitFor(() => {
          expect(result.current.snapToGrid).toBe(true);
        });
      });
    });

    describe('WHEN it re-renders without an attribute change', () => {
      test('THEN the same snapshot reference is reused', () => {
        const { result, rerender } = renderHook(() => useEditorPreferences());
        const first = result.current;

        rerender();

        expect(result.current).toBe(first);
      });
    });
  });

  describe('GIVEN two mounted hooks', () => {
    describe('WHEN both unmount', () => {
      test('THEN the observer disconnects only after the last subscriber leaves', () => {
        const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
        const first = renderHook(() => useEditorPreferences());
        const second = renderHook(() => useEditorPreferences());

        first.unmount();

        expect(disconnect).not.toHaveBeenCalled();

        second.unmount();

        expect(disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });
});
