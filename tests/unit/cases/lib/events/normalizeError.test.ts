import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { normalizeError } from '@/lib/events/normalizeError';

afterEach(() => {
  Reflect.deleteProperty(window.navigator, 'onLine');
});

describe('normalizeError', () => {
  describe('GIVEN an error with a known database code', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the category follows the code map', () => {
        expect(normalizeError({ code: '23505', message: 'duplicate key' })).toMatchObject({
          category: 'validation',
          message: 'duplicate key',
        });
      });
    });
  });

  describe('GIVEN an error with a known auth code', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the category follows the code map', () => {
        expect(normalizeError({ code: 'invalid_credentials', message: 'nope' })).toMatchObject({
          category: 'invalidCredentials',
        });
      });
    });
  });

  describe('GIVEN an error with only an http status', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the category follows the status map', () => {
        expect(normalizeError({ status: 403, message: 'forbidden' })).toMatchObject({ category: 'permission' });
        expect(normalizeError({ status: 404, message: 'missing' })).toMatchObject({ category: 'notFound' });
        expect(normalizeError({ status: 429, message: 'slow down' })).toMatchObject({ category: 'rateLimit' });
      });
    });
  });

  describe('GIVEN an error with both a code and a status', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the code takes precedence', () => {
        expect(normalizeError({ code: '42501', status: 404, message: 'denied' })).toMatchObject({
          category: 'permission',
        });
      });
    });
  });

  describe('GIVEN an error with an unmapped code and a mapped status', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the status map is used as a fallback', () => {
        expect(normalizeError({ code: 'not_a_real_code', status: 404, message: 'missing' })).toMatchObject({
          category: 'notFound',
        });
      });
    });
  });

  describe('GIVEN a fetch failure message', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the category is network', () => {
        expect(normalizeError(new TypeError('Failed to fetch'))).toMatchObject({ category: 'network' });
      });
    });
  });

  describe('GIVEN an offline browser', () => {
    beforeEach(() => {
      Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    });

    describe('WHEN an unremarkable error is normalized', () => {
      test('THEN the category is network', () => {
        expect(normalizeError({ message: 'something broke' })).toMatchObject({ category: 'network' });
      });
    });
  });

  describe('GIVEN a plain error without markers', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the category is unknown and the cause is preserved', () => {
        const cause = new Error('boom');

        expect(normalizeError(cause)).toEqual({ category: 'unknown', message: 'boom', cause });
      });
    });
  });

  describe('GIVEN a non-object value', () => {
    describe('WHEN it is normalized', () => {
      test('THEN the message is stringified', () => {
        expect(normalizeError('boom')).toMatchObject({ category: 'unknown', message: 'boom' });
      });
    });
  });
});
