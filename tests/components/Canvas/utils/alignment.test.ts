import { describe, expect, test } from 'vitest';

import { bareNode, measuredNode } from '@mocks/canvas';
import { computeAlignmentGuides } from '@/components/Canvas/utils';

describe('computeAlignmentGuides', () => {
  describe('GIVEN a dragged node without a measured size', () => {
    describe('WHEN guides are computed', () => {
      test('THEN no guides are produced', () => {
        expect(computeAlignmentGuides(bareNode('drag', 0, 0), [measuredNode('other', 0, 0, 100, 50)])).toEqual([]);
      });
    });
  });

  describe('GIVEN another node with a nearly aligned left edge', () => {
    describe('WHEN guides are computed', () => {
      test('THEN vertical guides span both nodes on every matching sample line', () => {
        const dragged = measuredNode('drag', 100, 0, 100, 50);
        const other = measuredNode('other', 102, 200, 100, 50);

        expect(computeAlignmentGuides(dragged, [dragged, other])).toEqual([
          { direction: 'vertical', position: 102, start: 0, end: 250 },
          { direction: 'vertical', position: 152, start: 0, end: 250 },
          { direction: 'vertical', position: 202, start: 0, end: 250 },
        ]);
      });
    });
  });

  describe('GIVEN another node with a nearly aligned top edge', () => {
    describe('WHEN guides are computed', () => {
      test('THEN horizontal guides span both nodes on every matching sample line', () => {
        const dragged = measuredNode('drag', 0, 100, 100, 50);
        const other = measuredNode('other', 300, 101, 100, 50);

        expect(computeAlignmentGuides(dragged, [other])).toEqual([
          { direction: 'horizontal', position: 101, start: 0, end: 400 },
          { direction: 'horizontal', position: 126, start: 0, end: 400 },
          { direction: 'horizontal', position: 151, start: 0, end: 400 },
        ]);
      });
    });
  });

  describe('GIVEN two neighbours aligned on the same guide line', () => {
    describe('WHEN guides are computed', () => {
      test('THEN their spans merge into one guide per line', () => {
        const dragged = measuredNode('drag', 100, 0, 100, 50);
        const above = measuredNode('above', 102, -300, 100, 50);
        const below = measuredNode('below', 102, 200, 100, 50);

        expect(computeAlignmentGuides(dragged, [above, below])).toEqual([
          { direction: 'vertical', position: 102, start: -300, end: 250 },
          { direction: 'vertical', position: 152, start: -300, end: 250 },
          { direction: 'vertical', position: 202, start: -300, end: 250 },
        ]);
      });
    });
  });

  describe('GIVEN a neighbour ten pixels off the aligned edge', () => {
    describe('WHEN guides are computed with the default threshold', () => {
      test('THEN no guides are produced', () => {
        const dragged = measuredNode('drag', 100, 0, 100, 50);
        const other = measuredNode('other', 110, 200, 100, 50);

        expect(computeAlignmentGuides(dragged, [other])).toEqual([]);
      });
    });

    describe('WHEN guides are computed with a wider threshold', () => {
      test('THEN the coarser alignment produces guides on every sample line', () => {
        const dragged = measuredNode('drag', 100, 0, 100, 50);
        const other = measuredNode('other', 110, 200, 100, 50);

        expect(computeAlignmentGuides(dragged, [other], 20)).toEqual([
          { direction: 'vertical', position: 110, start: 0, end: 250 },
          { direction: 'vertical', position: 160, start: 0, end: 250 },
          { direction: 'vertical', position: 210, start: 0, end: 250 },
        ]);
      });
    });
  });

  describe('GIVEN nodes far outside the threshold', () => {
    describe('WHEN guides are computed', () => {
      test('THEN no guides are produced', () => {
        const dragged = measuredNode('drag', 0, 0, 100, 50);
        const other = measuredNode('other', 500, 500, 100, 50);

        expect(computeAlignmentGuides(dragged, [other])).toEqual([]);
      });
    });
  });

  describe('GIVEN only the dragged node and an unmeasured neighbour', () => {
    describe('WHEN guides are computed', () => {
      test('THEN both are ignored', () => {
        const dragged = measuredNode('drag', 0, 0, 100, 50);

        expect(computeAlignmentGuides(dragged, [dragged, bareNode('ghost', 0, 0)])).toEqual([]);
      });
    });
  });
});
