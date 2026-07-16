import { describe, expect, test } from 'vitest';

import { isAvatarIcon } from '@/lib/utils';

describe('isAvatarIcon', () => {
  describe('GIVEN a known avatar icon id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isAvatarIcon('cat')).toBe(true);
      });
    });
  });

  describe('GIVEN an unknown icon id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isAvatarIcon('unicorn')).toBe(false);
      });
    });
  });

  describe('GIVEN a non-string value', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isAvatarIcon(42)).toBe(false);
        expect(isAvatarIcon(null)).toBe(false);
      });
    });
  });
});
