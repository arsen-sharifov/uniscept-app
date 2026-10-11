import { describe, expect, test } from 'vitest';

import { domRect } from '@mocks/browser';
import { GEOMETRY_ANCHOR_RECT } from '@mocks/geometry';
import { CANVAS_DOM_RECT, TOUR_GEOMETRY } from '@mocks/onboarding';
import { isInside, readViewport, sameGeometry } from '@/components/Tour/utils';

describe('isInside', () => {
  describe('GIVEN a box fully within the canvas', () => {
    describe('WHEN containment is checked', () => {
      test('THEN it counts as inside', () => {
        expect(isInside(domRect({ top: 100, left: 100, right: 300, bottom: 200 }), CANVAS_DOM_RECT)).toBe(true);
      });
    });
  });

  describe('GIVEN a box that crosses the right edge of the canvas', () => {
    describe('WHEN containment is checked', () => {
      test('THEN it does not count as inside', () => {
        expect(isInside(domRect({ top: 100, left: 700, right: 900, bottom: 200 }), CANVAS_DOM_RECT)).toBe(false);
      });
    });
  });
});

describe('sameGeometry', () => {
  describe('GIVEN two readings with equal rects', () => {
    describe('WHEN they are compared', () => {
      test('THEN they are the same even as separate objects', () => {
        expect(
          sameGeometry(TOUR_GEOMETRY, {
            ...TOUR_GEOMETRY,
            rect: { ...GEOMETRY_ANCHOR_RECT },
            lit: [{ ...GEOMETRY_ANCHOR_RECT }],
          }),
        ).toBe(true);
      });
    });
  });

  describe('GIVEN a reading where something now covers the target', () => {
    describe('WHEN it is compared with the previous one', () => {
      test('THEN it is a new geometry', () => {
        expect(sameGeometry(TOUR_GEOMETRY, { ...TOUR_GEOMETRY, blocked: GEOMETRY_ANCHOR_RECT })).toBe(false);
      });
    });
  });

  describe('GIVEN a reading where a more specific anchor now resolves to the same box', () => {
    describe('WHEN it is compared with the previous one', () => {
      test('THEN it is a new geometry, so the tracked anchor follows', () => {
        expect(sameGeometry(TOUR_GEOMETRY, { ...TOUR_GEOMETRY, anchor: 'canvasNodeUnmarked' })).toBe(false);
      });
    });
  });
});

describe('readViewport', () => {
  describe('GIVEN the current window', () => {
    describe('WHEN the viewport is read', () => {
      test('THEN it reports the inner size of the window', () => {
        expect(readViewport()).toEqual({ width: window.innerWidth, height: window.innerHeight });
      });
    });
  });
});
