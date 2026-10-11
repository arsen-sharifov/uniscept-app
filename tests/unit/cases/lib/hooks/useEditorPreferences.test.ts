import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import type { TEditorPreferences } from '@interfaces';
import { useEditorPreferences } from '@hooks';
import { DEFAULT_EDITOR_PREFERENCES } from '@mocks/preferences';

let preferences: { current: TEditorPreferences };

afterEach(() => {
  ['data-snap-to-grid', 'data-default-zoom', 'data-smart-guides'].forEach((attribute) =>
    document.documentElement.removeAttribute(attribute),
  );
});

describe('useEditorPreferences', () => {
  describe('GIVEN editor attributes on the root element', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-snap-to-grid', 'true');
      document.documentElement.setAttribute('data-default-zoom', '125');
      document.documentElement.setAttribute('data-smart-guides', 'false');
    });

    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        preferences = renderHook(() => useEditorPreferences()).result;
      });

      test('THEN the snapshot mirrors the attributes', () => {
        expect(preferences.current).toEqual({ snapToGrid: true, defaultZoom: 125, smartGuides: false });
      });
    });

    describe('WHEN the hook renders on the server', () => {
      let serverPreferences: TEditorPreferences | null = null;

      beforeEach(() => {
        renderToString(
          createElement(() => {
            serverPreferences = useEditorPreferences();

            return null;
          }),
        );
      });

      test('THEN the defaults apply until the client reads the attributes', () => {
        expect(serverPreferences).toEqual(DEFAULT_EDITOR_PREFERENCES);
      });
    });
  });

  describe('GIVEN an invalid zoom attribute', () => {
    beforeEach(() => {
      document.documentElement.setAttribute('data-default-zoom', '999');
    });

    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        preferences = renderHook(() => useEditorPreferences()).result;
      });

      test('THEN the zoom falls back to the default', () => {
        expect(preferences.current.defaultZoom).toBe(DEFAULT_EDITOR_PREFERENCES.defaultZoom);
      });
    });
  });

  describe('GIVEN no editor attributes', () => {
    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        preferences = renderHook(() => useEditorPreferences()).result;
      });

      test('THEN the defaults apply', () => {
        expect(preferences.current).toEqual(DEFAULT_EDITOR_PREFERENCES);
      });
    });
  });

  describe('GIVEN a rendered hook', () => {
    let rerender: () => void;

    beforeEach(() => {
      ({ result: preferences, rerender } = renderHook(() => useEditorPreferences()));
    });

    describe('WHEN an attribute changes afterwards', () => {
      beforeEach(async () => {
        document.documentElement.setAttribute('data-snap-to-grid', 'true');
        await act(() => Promise.resolve());
      });

      test('THEN the snapshot updates through the mutation observer', () => {
        expect(preferences.current.snapToGrid).toBe(true);
      });
    });

    describe('WHEN it re-renders without an attribute change', () => {
      let first: TEditorPreferences;

      beforeEach(() => {
        first = preferences.current;
        rerender();
      });

      test('THEN the same snapshot reference is reused', () => {
        expect(preferences.current).toBe(first);
      });
    });
  });
});
