import { describe, expect, test } from 'vitest';

import { LATIN_UNICODE_RANGE } from '@mocks/canvasExport';
import { parseUnicodeRanges } from '@/lib/canvas/export';

describe('parseUnicodeRanges', () => {
  describe('GIVEN a unicode-range with single points, spans and a wildcard', () => {
    describe('WHEN the ranges are parsed', () => {
      test('THEN every form becomes an inclusive code point span', () => {
        expect(parseUnicodeRanges(LATIN_UNICODE_RANGE)).toEqual([
          { start: 0x0000, end: 0x00ff },
          { start: 0x0131, end: 0x0131 },
          { start: 0x2000, end: 0x206f },
          { start: 0x400, end: 0x4ff },
        ]);
      });
    });
  });

  describe('GIVEN a face without a unicode-range', () => {
    describe('WHEN the ranges are parsed', () => {
      test('THEN no span is produced', () => {
        expect(parseUnicodeRanges('')).toEqual([]);
      });
    });
  });
});
