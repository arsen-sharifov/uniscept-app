import { describe, expect, test } from 'vitest';

import { getCanvasEdgePath, offsetAlongSide } from '@/lib/canvas';

describe('offsetAlongSide', () => {
  describe('GIVEN a point on each side of a node', () => {
    describe('WHEN it is pushed outwards by ten pixels', () => {
      test('THEN it moves along that side normal only', () => {
        expect(offsetAlongSide({ x: 100, y: 200 }, 'top', 10)).toEqual({ x: 100, y: 190 });
        expect(offsetAlongSide({ x: 100, y: 200 }, 'bottom', 10)).toEqual({ x: 100, y: 210 });
        expect(offsetAlongSide({ x: 100, y: 200 }, 'left', 10)).toEqual({ x: 90, y: 200 });
        expect(offsetAlongSide({ x: 100, y: 200 }, 'right', 10)).toEqual({ x: 110, y: 200 });
      });
    });
  });
});

describe('getCanvasEdgePath', () => {
  describe('GIVEN an edge leaving the bottom of one node for the top of another', () => {
    describe('WHEN the path is built', () => {
      test('THEN it starts at the source handle and stops one arrow length short of the target', () => {
        const path = getCanvasEdgePath({
          sourceX: 100,
          sourceY: 200,
          targetX: 300,
          targetY: 400,
          sourceSide: 'bottom',
          targetSide: 'top',
        });

        expect(path.startsWith('M100,200 ')).toBe(true);
        expect(path.endsWith(' 300,390')).toBe(true);
      });
    });
  });

  describe('GIVEN an edge between side handles', () => {
    describe('WHEN the path is built', () => {
      test('THEN the gap is left along the target handle axis', () => {
        const path = getCanvasEdgePath({
          sourceX: 100,
          sourceY: 200,
          targetX: 300,
          targetY: 400,
          sourceSide: 'right',
          targetSide: 'left',
        });

        expect(path.startsWith('M100,200 ')).toBe(true);
        expect(path.endsWith(' 290,400')).toBe(true);
      });
    });
  });

  describe('GIVEN a bidirectional edge that carries an arrowhead on both ends', () => {
    describe('WHEN the path is built', () => {
      test('THEN both ends leave room for their arrowhead', () => {
        const path = getCanvasEdgePath({
          sourceX: 100,
          sourceY: 200,
          targetX: 300,
          targetY: 400,
          sourceSide: 'bottom',
          targetSide: 'top',
          bidirectional: true,
        });

        expect(path.startsWith('M100,210 ')).toBe(true);
        expect(path.endsWith(' 300,390')).toBe(true);
      });
    });
  });

  describe('GIVEN the same endpoints with and without the reverse arrowhead', () => {
    describe('WHEN both paths are built', () => {
      test('THEN the curve is recomputed rather than reused', () => {
        const geometry = {
          sourceX: 100,
          sourceY: 200,
          targetX: 300,
          targetY: 400,
          sourceSide: 'bottom',
          targetSide: 'top',
        } as const;

        expect(getCanvasEdgePath(geometry)).not.toBe(getCanvasEdgePath({ ...geometry, bidirectional: true }));
      });
    });
  });
});
