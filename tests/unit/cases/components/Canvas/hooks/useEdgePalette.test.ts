import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useEdgePalette } from '@/components/Canvas/hooks';

const TOKEN_VALUES: Record<string, string> = {
  '--text-subtle': 'gray',
  '--status-success': 'green',
  '--status-error': 'red',
  '--status-warning': 'orange',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useEdgePalette', () => {
  describe('GIVEN theme tokens with computed values', () => {
    describe('WHEN the palette is built', () => {
      test('THEN every tone pairs its stroke and marker with the right token', () => {
        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
          getPropertyValue: (token: string) => TOKEN_VALUES[token] ?? '',
        } as unknown as CSSStyleDeclaration);

        const { result } = renderHook(() => useEdgePalette());

        expect(result.current).toEqual({
          default: { stroke: 'gray', marker: 'gray' },
          valid: { stroke: 'green', marker: 'green' },
          invalid: { stroke: 'red', marker: 'red' },
          tainted: { stroke: 'orange', marker: 'orange' },
        });
      });
    });
  });

  describe('GIVEN no computed token values', () => {
    describe('WHEN the palette is built', () => {
      test('THEN every tone falls back to its default color', () => {
        const { result } = renderHook(() => useEdgePalette());

        expect(result.current).toEqual({
          default: { stroke: 'rgba(13, 19, 16, 0.34)', marker: 'rgba(13, 19, 16, 0.34)' },
          valid: { stroke: 'rgb(21, 128, 61)', marker: 'rgb(21, 128, 61)' },
          invalid: { stroke: 'rgb(220, 38, 38)', marker: 'rgb(220, 38, 38)' },
          tainted: { stroke: 'rgb(180, 83, 9)', marker: 'rgb(180, 83, 9)' },
        });
      });
    });
  });

  describe('GIVEN a rendered palette', () => {
    describe('WHEN the hook re-renders without token changes', () => {
      test('THEN the same palette reference is reused', () => {
        const { result, rerender } = renderHook(() => useEdgePalette());
        const first = result.current;

        rerender();

        expect(result.current).toBe(first);
      });
    });
  });
});
