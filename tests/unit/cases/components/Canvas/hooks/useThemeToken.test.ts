import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubMediaQueries } from '@mocks/browser';
import { useThemeToken } from '@/components/Canvas/hooks';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const getPropertyValue = vi.fn();

let view: RenderHookResult<string, unknown>;
let mediaQueries: ReturnType<typeof stubMediaQueries>;

const stubComputedToken = () => {
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({ getPropertyValue } as unknown as CSSStyleDeclaration);
};

beforeEach(() => {
  mediaQueries = stubMediaQueries();
});

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useThemeToken', () => {
  describe('GIVEN a theme token with a padded computed value', () => {
    beforeEach(() => {
      stubComputedToken();
      getPropertyValue.mockReturnValue('  rgb(16, 185, 129)  ');
    });

    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        view = renderHook(() => useThemeToken('--status-success', 'fallback'));
      });

      test('THEN the trimmed value is returned', () => {
        expect(view.result.current).toBe('rgb(16, 185, 129)');
      });
    });
  });

  describe('GIVEN a theme token without a value', () => {
    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        view = renderHook(() => useThemeToken('--missing-token', 'fallback'));
      });

      test('THEN the fallback applies', () => {
        expect(view.result.current).toBe('fallback');
      });
    });
  });

  describe('GIVEN a rendered hook reading an explicit theme', () => {
    beforeEach(() => {
      stubComputedToken();
      getPropertyValue.mockReturnValue('old');
      view = renderHook(() => useThemeToken('--border-strong', 'fallback'));
    });

    describe('WHEN the theme attribute changes afterwards', () => {
      beforeEach(async () => {
        getPropertyValue.mockReturnValue('new');
        await act(async () => {
          document.documentElement.setAttribute('data-theme', 'eclipse');
        });
      });

      test('THEN the token is re-read', () => {
        expect(view.result.current).toBe('new');
      });
    });
  });

  describe('GIVEN a rendered hook under the automatic theme', () => {
    beforeEach(() => {
      stubComputedToken();
      getPropertyValue.mockReturnValue('light');
      view = renderHook(() => useThemeToken('--accent', 'fallback'));
    });

    describe('WHEN the operating system switches to the dark scheme', () => {
      beforeEach(() => {
        getPropertyValue.mockReturnValue('dark');
        act(() => mediaQueries.change(COLOR_SCHEME_QUERY, true));
      });

      test('THEN the token is re-read without a theme attribute change', () => {
        expect(view.result.current).toBe('dark');
      });
    });

    describe('WHEN the hook unmounts before the scheme changes', () => {
      beforeEach(() => {
        view.unmount();
        getPropertyValue.mockClear();
        mediaQueries.change(COLOR_SCHEME_QUERY, true);
      });

      test('THEN the scheme listener is gone and nothing is re-read', () => {
        expect(getPropertyValue).not.toHaveBeenCalled();
      });
    });
  });
});
