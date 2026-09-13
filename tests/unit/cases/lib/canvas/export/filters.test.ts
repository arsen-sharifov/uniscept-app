import { beforeEach, describe, expect, test } from 'vitest';

import type { ICanvasExportContext } from '@interfaces';

import { LAYERED_BOX_SHADOW } from '@mocks/canvasExport';
import { definitionContext } from '@mocks/canvasExportDom';
import { parseBoxShadowLayers, renderShadow } from '@/lib/canvas/export';

let context: ICanvasExportContext;
let references: (string | undefined)[];

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

describe('renderShadow', () => {
  beforeEach(() => {
    context = definitionContext();
  });

  describe('GIVEN the same layered shadow used by two boxes', () => {
    beforeEach(() => {
      references = [renderShadow(LAYERED_BOX_SHADOW, context), renderShadow(LAYERED_BOX_SHADOW, context)];
    });

    describe('WHEN the filters are rendered', () => {
      test('THEN one filter is defined, painted back to front, shrinking negative spreads and growing the rest', () => {
        const filter = context.defs.querySelector('filter');
        const operators = Array.from(filter?.querySelectorAll('feMorphology') ?? [], (node) =>
          node.getAttribute('operator'),
        );
        const merged = Array.from(filter?.querySelectorAll('feMergeNode') ?? [], (node) => node.getAttribute('in'));

        expect(references).toEqual(['url(#shadow-0)', 'url(#shadow-0)']);
        expect(context.defs.children).toHaveLength(1);
        expect(filter?.getAttribute('color-interpolation-filters')).toBe('sRGB');
        expect(operators).toEqual(['erode', 'dilate']);
        expect(merged).toEqual(['shadow-0', 'shadow-1', 'SourceGraphic']);
      });
    });
  });

  describe('GIVEN no shadow or only an inset shadow', () => {
    beforeEach(() => {
      references = [renderShadow('none', context), renderShadow('rgba(0, 0, 0, 0.1) 0px 0px 0px 1px inset', context)];
    });

    describe('WHEN the filters are rendered', () => {
      test('THEN nothing is defined and the box keeps no filter', () => {
        expect(references).toEqual([undefined, undefined]);
        expect(context.defs.children).toHaveLength(0);
      });
    });
  });
});
