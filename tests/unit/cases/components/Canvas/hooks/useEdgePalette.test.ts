import { type RenderHookResult, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TEdgeTone } from '@interfaces';

import { stubMediaQueries } from '@mocks/browser';
import { useEdgePalette } from '@/components/Canvas/hooks';

const TOKEN_VALUES: Record<string, string> = {
  '--text-subtle': 'gray',
  '--status-success': 'green',
  '--decision': 'purple',
  '--status-error': 'red',
  '--status-warning': 'orange',
};

let view: RenderHookResult<Record<TEdgeTone, string>, unknown>;
let firstPalette: Record<TEdgeTone, string>;

beforeEach(() => {
  stubMediaQueries();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useEdgePalette', () => {
  describe('GIVEN theme tokens with computed values', () => {
    beforeEach(() => {
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: (token: string) => TOKEN_VALUES[token] ?? '',
      } as unknown as CSSStyleDeclaration);
    });

    describe('WHEN the palette is built', () => {
      beforeEach(() => {
        view = renderHook(() => useEdgePalette());
      });

      test('THEN every tone resolves to the right token', () => {
        expect(view.result.current).toEqual({
          default: 'gray',
          valid: 'green',
          answer: 'purple',
          invalid: 'red',
          tainted: 'orange',
        });
      });
    });
  });

  describe('GIVEN no computed token values', () => {
    describe('WHEN the palette is built', () => {
      beforeEach(() => {
        view = renderHook(() => useEdgePalette());
      });

      test('THEN every tone falls back to its default color', () => {
        expect(view.result.current).toEqual({
          default: 'rgba(13, 19, 16, 0.34)',
          valid: 'rgb(21, 128, 61)',
          answer: 'rgb(124, 58, 237)',
          invalid: 'rgb(220, 38, 38)',
          tainted: 'rgb(180, 83, 9)',
        });
      });
    });
  });

  describe('GIVEN a rendered palette', () => {
    beforeEach(() => {
      view = renderHook(() => useEdgePalette());
      firstPalette = view.result.current;
    });

    describe('WHEN the hook re-renders without token changes', () => {
      beforeEach(() => {
        view.rerender();
      });

      test('THEN the same palette reference is reused', () => {
        expect(view.result.current).toBe(firstPalette);
      });
    });
  });
});
