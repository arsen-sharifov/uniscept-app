import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { RATE_LIMIT_MAX_TRACKED_KEYS } from '@constants';
import { createRateLimiter } from '@api/server/utils';

afterEach(() => {
  vi.useRealTimers();
});

describe('createRateLimiter', () => {
  describe('GIVEN a limiter that allows two attempts per minute', () => {
    let allowAttempt: ReturnType<typeof createRateLimiter>;

    beforeEach(() => {
      allowAttempt = createRateLimiter({ maxAttempts: 2, windowMs: 60_000 });
    });

    describe('WHEN one key attempts three times and another key once', () => {
      let results: boolean[];

      beforeEach(() => {
        results = [allowAttempt('ip-1'), allowAttempt('ip-1'), allowAttempt('ip-1'), allowAttempt('ip-2')];
      });

      test('THEN the third attempt of the first key is refused while the other key keeps its own budget', () => {
        expect(results).toEqual([true, true, false, true]);
      });
    });
  });

  describe('GIVEN a key that used up its attempts', () => {
    let allowAttempt: ReturnType<typeof createRateLimiter>;

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      allowAttempt = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
      allowAttempt('ip-1');
    });

    describe('WHEN it attempts again just before the window ends', () => {
      let allowed: boolean;

      beforeEach(() => {
        vi.setSystemTime(Date.now() + 59_999);
        allowed = allowAttempt('ip-1');
      });

      test('THEN the attempt is refused', () => {
        expect(allowed).toBe(false);
      });
    });

    describe('WHEN it attempts again once the window has elapsed', () => {
      let allowed: boolean;

      beforeEach(() => {
        vi.setSystemTime(Date.now() + 60_000);
        allowed = allowAttempt('ip-1');
      });

      test('THEN a fresh window accepts the attempt', () => {
        expect(allowed).toBe(true);
      });
    });
  });

  describe('GIVEN a limiter that tracks the maximum number of exhausted keys', () => {
    let allowAttempt: ReturnType<typeof createRateLimiter>;

    beforeEach(() => {
      allowAttempt = createRateLimiter({ maxAttempts: 1, windowMs: 60_000 });
      Array.from({ length: RATE_LIMIT_MAX_TRACKED_KEYS }, (_, index) => allowAttempt(`ip-${index}`));
    });

    describe('WHEN a new key arrives and the oldest and newest keys attempt again', () => {
      let results: boolean[];

      beforeEach(() => {
        results = [allowAttempt('ip-new'), allowAttempt('ip-0'), allowAttempt(`ip-${RATE_LIMIT_MAX_TRACKED_KEYS - 1}`)];
      });

      test('THEN the oldest key is forgotten to make room while the newest key stays limited', () => {
        expect(results).toEqual([true, true, false]);
      });
    });
  });
});
