import { describe, expect, test } from 'vitest';

import { comment } from '@mocks/canvas';
import { isOwnComment } from '@/components/Canvas/utils';

describe('isOwnComment', () => {
  describe('GIVEN a comment authored by the current user', () => {
    describe('WHEN ownership is checked', () => {
      test('THEN the comment is owned', () => {
        expect(isOwnComment(comment('c1'), 'user-1')).toBe(true);
      });
    });
  });

  describe('GIVEN a comment authored by someone else', () => {
    describe('WHEN ownership is checked', () => {
      test('THEN the comment is not owned', () => {
        expect(isOwnComment(comment('c1', { authorId: 'user-2' }), 'user-1')).toBe(false);
      });
    });
  });

  describe('GIVEN no signed-in user', () => {
    describe('WHEN ownership is checked', () => {
      test('THEN the comment is not owned', () => {
        expect(isOwnComment(comment('c1'), null)).toBe(false);
      });
    });
  });
});
