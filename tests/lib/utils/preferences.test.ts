import { describe, expect, test } from 'vitest';

import { isDefaultZoom } from '@/lib/utils';

describe('isDefaultZoom', () => {
  describe('GIVEN one of the preset zoom values', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it passes', () => {
        expect(isDefaultZoom(100)).toBe(true);
        expect(isDefaultZoom(150)).toBe(true);
      });
    });
  });

  describe('GIVEN a zoom value outside the presets', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isDefaultZoom(33)).toBe(false);
      });
    });
  });

  describe('GIVEN a non-numeric value', () => {
    describe('WHEN the value is checked', () => {
      test('THEN it fails', () => {
        expect(isDefaultZoom('100')).toBe(false);
      });
    });
  });
});
