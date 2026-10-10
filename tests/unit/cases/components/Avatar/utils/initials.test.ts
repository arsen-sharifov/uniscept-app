import { describe, expect, test } from 'vitest';

import { getInitials } from '@/components/Avatar';

describe('getInitials', () => {
  describe('GIVEN a full name', () => {
    describe('WHEN its initials are taken', () => {
      test('THEN the first letters of the first two words are capitalised', () => {
        expect(getInitials('ada lovelace byron')).toBe('AL');
      });
    });
  });

  describe('GIVEN a blank name', () => {
    describe('WHEN its initials are taken', () => {
      test('THEN a neutral initial stands in', () => {
        expect(getInitials('   ')).toBe('U');
      });
    });
  });
});
