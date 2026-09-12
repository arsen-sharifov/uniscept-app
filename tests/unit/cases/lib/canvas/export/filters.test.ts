import { describe, expect, test } from 'vitest';

import { LAYERED_BOX_SHADOW } from '@mocks/canvasExport';
import { parseBoxShadowLayers } from '@/lib/canvas/export';

describe('parseBoxShadowLayers', () => {
  describe('GIVEN a computed box-shadow with two outer layers and one inset layer', () => {
    describe('WHEN the layers are parsed', () => {
      test('THEN the outer layers keep their colour and offsets while the inset layer is dropped', () => {
        expect(parseBoxShadowLayers(LAYERED_BOX_SHADOW)).toEqual([
          { color: 'rgba(13, 19, 16, 0.06)', dx: 0, dy: 1, blur: 2, spread: 0 },
          { color: 'rgba(13, 19, 16, 0.1)', dx: 0, dy: 8, blur: 24, spread: -6 },
        ]);
      });
    });
  });

  describe('GIVEN no shadow', () => {
    describe('WHEN the layers are parsed', () => {
      test('THEN nothing is produced', () => {
        expect(parseBoxShadowLayers('none')).toEqual([]);
      });
    });
  });
});
