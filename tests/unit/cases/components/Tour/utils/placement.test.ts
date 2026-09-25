import { describe, expect, test } from 'vitest';

import { placeCard } from '@/components/Tour/utils';

const VIEWPORT = { width: 1440, height: 900 };

const CARD = { width: 300, height: 160 };

const RECT = { top: 400, left: 700, width: 120, height: 40 };

describe('placeCard', () => {
  describe('GIVEN an anchor with room on every side', () => {
    describe('WHEN the card is placed', () => {
      test('THEN it sits beside the anchor on the requested side', () => {
        expect(placeCard(RECT, 'right', CARD, VIEWPORT)).toEqual({ left: 838, top: 340 });
        expect(placeCard(RECT, 'left', CARD, VIEWPORT)).toEqual({ left: 382, top: 340 });
        expect(placeCard(RECT, 'top', CARD, VIEWPORT)).toEqual({ left: 610, top: 222 });
        expect(placeCard(RECT, 'bottom', CARD, VIEWPORT)).toEqual({ left: 610, top: 458 });
      });
    });
  });

  describe('GIVEN a step that explains instead of pointing', () => {
    describe('WHEN the card is placed in the center', () => {
      test('THEN it sits in the middle of the viewport, anchor or not', () => {
        expect(placeCard(null, 'center', CARD, VIEWPORT)).toEqual({ left: 570, top: 370 });
        expect(placeCard(RECT, 'center', CARD, VIEWPORT)).toEqual({ left: 570, top: 370 });
      });
    });
  });

  describe('GIVEN an anchor pinned to the right edge', () => {
    describe('WHEN the card is asked for the right side', () => {
      test('THEN it flips to the left', () => {
        const edge = { top: 400, left: 1380, width: 44, height: 44 };

        expect(placeCard(edge, 'right', CARD, VIEWPORT)).toEqual({ left: 1062, top: 342 });
      });
    });
  });

  describe('GIVEN a tall card beside a short anchor near the top edge', () => {
    describe('WHEN the card is placed', () => {
      test('THEN it stays beside the anchor and only slides down into view', () => {
        const switcher = { top: 65, left: 10, width: 260, height: 50 };

        expect(placeCard(switcher, 'right', { width: 420, height: 200 }, VIEWPORT)).toEqual({ left: 288, top: 12 });
      });
    });
  });

  describe('GIVEN an anchor that fills the viewport', () => {
    describe('WHEN the card is placed', () => {
      test('THEN it falls back to the bottom of the screen', () => {
        const wide = { top: 0, left: 0, width: 1440, height: 900 };

        expect(placeCard(wide, 'right', CARD, VIEWPORT)).toEqual({ left: 570, top: 686 });
      });
    });
  });

  describe('GIVEN no anchor yet', () => {
    describe('WHEN the card is placed', () => {
      test('THEN it uses the same unanchored spot', () => {
        expect(placeCard(null, 'right', CARD, VIEWPORT)).toEqual({ left: 570, top: 686 });
      });
    });
  });

  describe('GIVEN a card that has not been measured', () => {
    describe('WHEN the card is placed', () => {
      test('THEN it waits in the unanchored spot instead of jumping', () => {
        expect(placeCard(RECT, 'right', { width: 0, height: 0 }, VIEWPORT)).toEqual({ left: 720, top: 846 });
      });
    });
  });
});
