import { describe, expect, test } from 'vitest';

import { isGuideId } from '@/lib/utils';

describe('isGuideId', () => {
  describe('GIVEN a known guide id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isGuideId('base')).toBe(true);
        expect(isGuideId('example')).toBe(true);
      });
    });
  });

  describe('GIVEN an unknown guide id', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isGuideId('nonsense')).toBe(false);
      });
    });
  });

  describe('GIVEN a non-string value', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isGuideId(7)).toBe(false);
        expect(isGuideId(null)).toBe(false);
      });
    });
  });
});
