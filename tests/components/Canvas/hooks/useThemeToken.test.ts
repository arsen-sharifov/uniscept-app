import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useThemeToken } from '@/components/Canvas/hooks';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  vi.restoreAllMocks();
});

describe('useThemeToken', () => {
  describe('GIVEN a theme token with a computed value', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the trimmed value is returned', () => {
        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
          getPropertyValue: () => '  rgb(16, 185, 129)  ',
        } as unknown as CSSStyleDeclaration);

        const { result } = renderHook(() => useThemeToken('--status-success', 'fallback'));

        expect(result.current).toBe('rgb(16, 185, 129)');
      });
    });
  });

  describe('GIVEN a theme token without a value', () => {
    describe('WHEN the hook renders', () => {
      test('THEN the fallback applies', () => {
        const { result } = renderHook(() => useThemeToken('--missing-token', 'fallback'));

        expect(result.current).toBe('fallback');
      });
    });
  });

  describe('GIVEN a rendered hook', () => {
    describe('WHEN the theme attribute changes afterwards', () => {
      test('THEN the token is re-read through the mutation observer', async () => {
        const getPropertyValue = vi.fn(() => 'old');

        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
          getPropertyValue,
        } as unknown as CSSStyleDeclaration);

        const { result } = renderHook(() => useThemeToken('--border-strong', 'fallback'));

        expect(result.current).toBe('old');

        getPropertyValue.mockReturnValue('new');
        document.documentElement.setAttribute('data-theme', 'eclipse');

        await waitFor(() => {
          expect(result.current).toBe('new');
        });
      });
    });
  });
});
