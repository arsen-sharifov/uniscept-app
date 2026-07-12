import { describe, expect, test } from 'vitest';

import { bareNode, measuredNode } from '@mocks/canvas';
import { findNearestHandlePair, isHandleId } from '@/lib/canvas';

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
