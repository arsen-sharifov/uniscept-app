import { describe, expect, test } from 'vitest';

import { isBadgeId } from '@/lib/utils';

describe('isBadgeId', () => {
  describe('GIVEN a known badge id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isBadgeId('founder')).toBe(true);
      });
    });
  });

  describe('GIVEN an unknown badge id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isBadgeId('legend')).toBe(false);
      });
    });
  });

  describe('GIVEN a non-string value', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isBadgeId(42)).toBe(false);
        expect(isBadgeId(null)).toBe(false);
      });
    });
  });
});
