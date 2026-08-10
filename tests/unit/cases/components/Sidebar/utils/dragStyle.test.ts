import { describe, expect, test } from 'vitest';

import { getDragTransformStyle } from '@/components/Sidebar/utils';

describe('getDragTransformStyle', () => {
  describe('GIVEN an actively dragged item', () => {
    describe('WHEN the style is computed', () => {
      test('THEN transform and transition are suppressed', () => {
        expect(getDragTransformStyle({ x: 10, y: 20, scaleX: 1.2, scaleY: 0.8 }, 'transform 200ms', true)).toEqual({
          transform: undefined,
          transition: undefined,
        });
      });
    });
  });

  describe('GIVEN an idle item with a sortable transform', () => {
    describe('WHEN the style is computed', () => {
      test('THEN the transform applies without scaling', () => {
        expect(getDragTransformStyle({ x: 10, y: 20, scaleX: 1.2, scaleY: 0.8 }, 'transform 200ms', false)).toEqual({
          transform: 'translate3d(10px, 20px, 0) scaleX(1) scaleY(1)',
          transition: 'transform 200ms',
        });
      });
    });
  });

  describe('GIVEN an idle item without a transform', () => {
    describe('WHEN the style is computed', () => {
      test('THEN no transform is produced and the transition passes through', () => {
        const style = getDragTransformStyle(null, 'transform 200ms', false);

        expect(style.transform).toBeFalsy();
        expect(style.transition).toBe('transform 200ms');
      });
    });
  });
});
