import { describe, expect, test } from 'vitest';

import { EXPORT_RECTS } from '@mocks/canvasExport';
import { getExportBounds } from '@/lib/canvas/export';

describe('getExportBounds', () => {
  describe('GIVEN nodes at negative and distant coordinates and an edge bending beyond them', () => {
    describe('WHEN the whole graph is measured', () => {
      test('THEN it includes every node and the complete curve', () => {
        expect(getExportBounds(EXPORT_RECTS)).toEqual({ x: -560, y: -230, width: 2740, height: 1530 });
      });
    });
  });

  describe('GIVEN an empty canvas', () => {
    describe('WHEN export bounds are requested', () => {
      test('THEN it refuses to create a meaningless image', () => {
        expect(() => getExportBounds([])).toThrow('The canvas is empty');
      });
    });
  });
});
