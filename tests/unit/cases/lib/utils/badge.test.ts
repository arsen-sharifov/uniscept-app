import { describe, expect, test } from 'vitest';

import { DEFAULT_BADGES } from '@constants';
import { isBadgeId, resolveEarnedBadges } from '@/lib/utils';

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

describe('resolveEarnedBadges', () => {
  describe('GIVEN stored badges with an unknown id among them', () => {
    describe('WHEN they are resolved', () => {
      test('THEN only the known badges are kept', () => {
        expect(resolveEarnedBadges(['founder', 'legend', 'initiate'])).toEqual(['founder', 'initiate']);
      });
    });
  });

  describe('GIVEN nothing usable stored', () => {
    describe('WHEN it is resolved', () => {
      test('THEN the default badges stand in', () => {
        expect(resolveEarnedBadges(undefined)).toBe(DEFAULT_BADGES);
        expect(resolveEarnedBadges('founder')).toBe(DEFAULT_BADGES);
        expect(resolveEarnedBadges(['legend'])).toBe(DEFAULT_BADGES);
      });
    });
  });
});
