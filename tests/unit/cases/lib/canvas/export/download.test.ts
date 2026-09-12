import { describe, expect, test } from 'vitest';

import { LONG_THREAD_NAME, UNICODE_THREAD_NAME } from '@mocks/canvasExport';
import { getExportFilename, getRasterDimensions } from '@/lib/canvas/export';

describe('getExportFilename', () => {
  describe('GIVEN a multilingual thread name with forbidden filename characters', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it preserves Unicode and replaces path separators', () => {
        expect(getExportFilename(UNICODE_THREAD_NAME, 'svg')).toBe('Рішення- café - équipe-.svg');
      });
    });
  });

  describe('GIVEN a Windows device name or an empty name', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it produces a usable filename', () => {
        expect(getExportFilename('CON', 'png')).toBe('_CON.png');
        expect(getExportFilename('LPT1.notes', 'jpg')).toBe('_LPT1.notes.jpg');
        expect(getExportFilename(' ... ', 'svg')).toBe('Uniscept.svg');
      });
    });
  });

  describe('GIVEN a long thread name', () => {
    describe('WHEN the export filename is created', () => {
      test('THEN it leaves room for the extension', () => {
        expect(getExportFilename(LONG_THREAD_NAME, 'png')).toHaveLength(124);
        expect(getExportFilename(LONG_THREAD_NAME, 'png')).toMatch(/\.png$/);
      });
    });
  });
});

describe('getRasterDimensions', () => {
  describe('GIVEN a typical graph', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it uses three pixels per canvas pixel', () => {
        expect(getRasterDimensions(1200, 800)).toEqual({ width: 3600, height: 2400 });
      });
    });
  });

  describe('GIVEN a large graph that exceeds the preferred pixel budget', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it preserves at least double resolution within the memory limit', () => {
        expect(getRasterDimensions(4000, 4000)).toEqual({ width: 8192, height: 8192 });
      });
    });
  });

  describe('GIVEN a graph too large for a readable bitmap', () => {
    describe('WHEN raster dimensions are computed', () => {
      test('THEN it yields no dimensions so the caller can suggest a vector export', () => {
        expect(getRasterDimensions(9000, 1000)).toBeNull();
        expect(getRasterDimensions(5000, 5000)).toBeNull();
      });
    });
  });
});
