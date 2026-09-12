import { describe, expect, test } from 'vitest';

import { NESTED_CSS_LIST, SRGB_WASH_COLOR } from '@mocks/canvasExport';
import { parseCssColor, splitCssList } from '@/lib/canvas/export';

describe('splitCssList', () => {
  describe('GIVEN a comma-separated list whose items contain nested function calls', () => {
    describe('WHEN the list is split', () => {
      test('THEN only top-level commas separate items and the items are trimmed', () => {
        expect(splitCssList(NESTED_CSS_LIST)).toEqual([
          'color-mix(in srgb, rgb(220, 38, 38) 12%, transparent)',
          'rgba(0, 0, 0, 0.5)',
          '4px',
        ]);
      });
    });
  });

  describe('GIVEN an empty value', () => {
    describe('WHEN the list is split', () => {
      test('THEN it yields no items', () => {
        expect(splitCssList('')).toEqual([]);
      });
    });
  });
});

describe('parseCssColor', () => {
  describe('GIVEN a computed colour already expressed in the rgb family', () => {
    describe('WHEN it is parsed', () => {
      test('THEN it passes through untouched', () => {
        expect(parseCssColor('rgb(220, 38, 38)')).toBe('rgb(220, 38, 38)');
        expect(parseCssColor('rgba(0, 0, 0, 0.5)')).toBe('rgba(0, 0, 0, 0.5)');
      });
    });
  });

  describe('GIVEN a computed colour in the srgb colour function', () => {
    describe('WHEN it is parsed', () => {
      test('THEN the channels are scaled to eight bits and the alpha is kept', () => {
        expect(parseCssColor(SRGB_WASH_COLOR)).toBe('rgba(220, 38, 38, 0.07)');
        expect(parseCssColor('color(srgb 1 1 1)')).toBe('rgba(255, 255, 255, 1)');
      });
    });
  });

  describe('GIVEN a colour in another space', () => {
    describe('WHEN it is parsed', () => {
      test('THEN nothing is returned so the caller can sample it', () => {
        expect(parseCssColor('oklch(0.6 0.2 30)')).toBeUndefined();
      });
    });
  });
});
