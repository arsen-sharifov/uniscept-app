import { describe, expect, test } from 'vitest';

import { bareNode, measuredNode } from '@mocks/canvas';
import { findNearestHandlePair, findNearestSides, getHandleAnchor, isHandleId } from '@/lib/canvas';

describe('isHandleId', () => {
  describe('GIVEN one of the four handle ids', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isHandleId('top')).toBe(true);
        expect(isHandleId('right')).toBe(true);
        expect(isHandleId('bottom')).toBe(true);
        expect(isHandleId('left')).toBe(true);
      });
    });
  });

  describe('GIVEN anything else', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isHandleId('center')).toBe(false);
        expect(isHandleId(42)).toBe(false);
        expect(isHandleId(null)).toBe(false);
      });
    });
  });
});

describe('findNearestHandlePair', () => {
  describe('GIVEN a target directly to the right of the source', () => {
    describe('WHEN the nearest pair is searched', () => {
      test('THEN it connects right to left', () => {
        const source = measuredNode('a', 0, 0, 100, 40);
        const target = measuredNode('b', 300, 0, 100, 40);

        expect(findNearestHandlePair(source, target)).toEqual({ sourceHandle: 'right', targetHandle: 'left' });
      });
    });
  });

  describe('GIVEN a target directly below the source', () => {
    describe('WHEN the nearest pair is searched', () => {
      test('THEN it connects bottom to top', () => {
        const source = measuredNode('a', 0, 0, 100, 40);
        const target = measuredNode('b', 0, 300, 100, 40);

        expect(findNearestHandlePair(source, target)).toEqual({ sourceHandle: 'bottom', targetHandle: 'top' });
      });
    });
  });

  describe('GIVEN a target directly to the left of the source', () => {
    describe('WHEN the nearest pair is searched', () => {
      test('THEN it connects left to right', () => {
        const source = measuredNode('a', 300, 0, 100, 40);
        const target = measuredNode('b', 0, 0, 100, 40);

        expect(findNearestHandlePair(source, target)).toEqual({ sourceHandle: 'left', targetHandle: 'right' });
      });
    });
  });

  describe('GIVEN a target diagonally offset at equal handle distances', () => {
    describe('WHEN the nearest pair is searched', () => {
      test('THEN the first candidate in handle order wins the tie', () => {
        const source = measuredNode('a', 0, 0, 100, 100);
        const target = measuredNode('b', 300, 300, 100, 100);

        expect(findNearestHandlePair(source, target)).toEqual({ sourceHandle: 'right', targetHandle: 'top' });
      });
    });
  });

  describe('GIVEN unmeasured nodes', () => {
    describe('WHEN the nearest pair is searched', () => {
      test('THEN default dimensions still produce the nearest pair', () => {
        expect(findNearestHandlePair(bareNode('a', 0, 0), bareNode('b', 0, 400))).toEqual({
          sourceHandle: 'bottom',
          targetHandle: 'top',
        });
      });
    });
  });
});

describe('getHandleAnchor', () => {
  describe('GIVEN a rect', () => {
    describe('WHEN each side anchor is resolved', () => {
      test('THEN it sits at the middle of that side', () => {
        const rect = { x: 10, y: 20, width: 100, height: 40 };

        expect(getHandleAnchor(rect, 'top')).toEqual({ x: 60, y: 20 });
        expect(getHandleAnchor(rect, 'right')).toEqual({ x: 110, y: 40 });
        expect(getHandleAnchor(rect, 'bottom')).toEqual({ x: 60, y: 60 });
        expect(getHandleAnchor(rect, 'left')).toEqual({ x: 10, y: 40 });
      });
    });
  });
});

describe('findNearestSides', () => {
  describe('GIVEN a wide target sitting below and left of the source with its top edge nearest the source side', () => {
    describe('WHEN the nearest sides are searched', () => {
      test('THEN it leaves the source sideways and enters the target from the top', () => {
        const source = { x: 195, y: 55, width: 260, height: 75 };
        const target = { x: 15, y: 240, width: 335, height: 110 };

        expect(findNearestSides(source, target)).toEqual({ sourceHandle: 'left', targetHandle: 'top' });
      });
    });
  });

  describe('GIVEN a target directly below the source', () => {
    describe('WHEN the nearest sides are searched', () => {
      test('THEN it connects bottom to top', () => {
        const source = { x: 0, y: 0, width: 100, height: 40 };
        const target = { x: 0, y: 300, width: 100, height: 40 };

        expect(findNearestSides(source, target)).toEqual({ sourceHandle: 'bottom', targetHandle: 'top' });
      });
    });
  });
});
