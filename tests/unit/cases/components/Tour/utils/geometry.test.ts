import { describe, expect, test } from 'vitest';

import type { ITourGeometry } from '@interfaces';

import { domRect } from '@mocks/browser';
import { isInside, readViewport, sameGeometry } from '@/components/Tour/utils';

const CANVAS = domRect({ top: 0, left: 0, right: 800, bottom: 600 });

const RECT = { top: 10, left: 20, width: 30, height: 40 };

const GEOMETRY: ITourGeometry = { rect: RECT, anchor: 'canvas', blocked: null, lit: [RECT], open: [RECT] };

describe('isInside', () => {
  describe('GIVEN a box fully within the canvas', () => {
    describe('WHEN containment is checked', () => {
      test('THEN it counts as inside', () => {
        expect(isInside(domRect({ top: 100, left: 100, right: 300, bottom: 200 }), CANVAS)).toBe(true);
      });
    });
  });

  describe('GIVEN a box that crosses the right edge of the canvas', () => {
    describe('WHEN containment is checked', () => {
      test('THEN it does not count as inside', () => {
        expect(isInside(domRect({ top: 100, left: 700, right: 900, bottom: 200 }), CANVAS)).toBe(false);
      });
    });
  });
});

describe('sameGeometry', () => {
  describe('GIVEN two readings with equal rects', () => {
    describe('WHEN they are compared', () => {
      test('THEN they are the same even as separate objects', () => {
        expect(sameGeometry(GEOMETRY, { ...GEOMETRY, rect: { ...RECT }, lit: [{ ...RECT }] })).toBe(true);
      });
    });
  });

  describe('GIVEN a reading where something now covers the target', () => {
    describe('WHEN it is compared with the previous one', () => {
      test('THEN it is a new geometry', () => {
        expect(sameGeometry(GEOMETRY, { ...GEOMETRY, blocked: RECT })).toBe(false);
      });
    });
  });

  describe('GIVEN a reading where a more specific anchor now resolves to the same box', () => {
    describe('WHEN it is compared with the previous one', () => {
      test('THEN it is a new geometry, so the tracked anchor follows', () => {
        expect(sameGeometry(GEOMETRY, { ...GEOMETRY, anchor: 'canvasNodeUnmarked' })).toBe(false);
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
