import { describe, expect, test } from 'vitest';

import { toParam } from '@/lib/utils';

describe('toParam', () => {
  describe('GIVEN an array parameter', () => {
    describe('WHEN it is unwrapped', () => {
      test('THEN the first entry wins', () => {
        expect(toParam(['first', 'second'])).toBe('first');
      });
    });
  });

  describe('GIVEN an empty array parameter', () => {
    describe('WHEN it is unwrapped', () => {
      test('THEN it falls back to an empty string', () => {
        expect(toParam([])).toBe('');
      });
    });
  });

  describe('GIVEN a plain string parameter', () => {
    describe('WHEN it is unwrapped', () => {
      test('THEN it is returned as is', () => {
        expect(toParam('value')).toBe('value');
      });
    });
  });

  describe('GIVEN a missing parameter', () => {
    describe('WHEN it is unwrapped', () => {
      test('THEN it falls back to an empty string', () => {
        expect(toParam(undefined)).toBe('');
      });
    });
  });
});
