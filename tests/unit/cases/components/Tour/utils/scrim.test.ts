import { describe, expect, test } from 'vitest';

import { SPOTLIGHT_PADDING } from '@constants';
import { buildScrimPath, inflate, mergeHoles } from '@/components/Tour/utils';

const RECT = { top: 100, left: 200, width: 60, height: 40 };

describe('inflate', () => {
  describe('GIVEN an anchor rect', () => {
    describe('WHEN it is inflated for the spotlight', () => {
      test('THEN it grows by the padding on every side', () => {
        expect(inflate(RECT)).toEqual({
          top: 100 - SPOTLIGHT_PADDING,
          left: 200 - SPOTLIGHT_PADDING,
          width: 60 + SPOTLIGHT_PADDING * 2,
          height: 40 + SPOTLIGHT_PADDING * 2,
        });
      });
    });
  });
});

describe('buildScrimPath', () => {
  describe('GIVEN no holes', () => {
    describe('WHEN the scrim path is built', () => {
      test('THEN it is a single covering rectangle', () => {
        expect(buildScrimPath([]).match(/M/g)).toHaveLength(1);
      });
    });
  });

  describe('GIVEN two holes', () => {
    describe('WHEN the scrim path is built', () => {
      test('THEN each hole adds its own subpath', () => {
        const path = buildScrimPath([RECT, { top: 0, left: 0, width: 300, height: 80 }]);

        expect(path.match(/M/g)).toHaveLength(3);
        expect(path.match(/Z/g)).toHaveLength(3);
      });
    });
  });

  describe('GIVEN a hole smaller than the corner radius', () => {
    describe('WHEN the scrim path is built', () => {
      test('THEN the radius shrinks to half the hole instead of inverting the corners', () => {
        const [, hole] = buildScrimPath([{ top: 10, left: 10, width: 2, height: 2 }]).split('Z ');

        expect(hole).toContain('A11 11 0 0 1');
        expect(hole).not.toContain('-');
      });
    });
  });
});

describe('mergeHoles', () => {
  describe('GIVEN a hole nested inside another', () => {
    describe('WHEN the holes are merged', () => {
      test('THEN only the outer one survives, so the overlap is not sealed back up', () => {
        const modal = { top: 50, left: 150, width: 1100, height: 800 };
        const nav = { top: 60, left: 160, width: 200, height: 780 };

        expect(mergeHoles([modal, nav])).toEqual([modal]);
      });
    });
  });

  describe('GIVEN two holes that only clip each other', () => {
    describe('WHEN the holes are merged', () => {
      test('THEN they become one box that covers both', () => {
        const a = { top: 0, left: 0, width: 100, height: 100 };
        const b = { top: 50, left: 50, width: 100, height: 100 };

        expect(mergeHoles([a, b])).toEqual([{ top: 0, left: 0, width: 150, height: 150 }]);
      });
    });
  });

  describe('GIVEN holes that never touch', () => {
    describe('WHEN the holes are merged', () => {
      test('THEN each one is kept on its own', () => {
        const a = { top: 0, left: 0, width: 40, height: 40 };
        const b = { top: 500, left: 500, width: 40, height: 40 };

        expect(mergeHoles([a, b])).toEqual([a, b]);
      });
    });
  });

  describe('GIVEN a chain where merging creates a new overlap', () => {
    describe('WHEN the holes are merged', () => {
      test('THEN the merge repeats until nothing overlaps', () => {
        const merged = mergeHoles([
          { top: 0, left: 0, width: 50, height: 10 },
          { top: 0, left: 200, width: 50, height: 10 },
          { top: 0, left: 40, width: 180, height: 10 },
        ]);

        expect(merged).toEqual([{ top: 0, left: 0, width: 250, height: 10 }]);
      });
    });
  });
});
