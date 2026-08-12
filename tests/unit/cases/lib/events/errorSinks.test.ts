import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { reportError } from '@/lib/events';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reportError', () => {
  describe('GIVEN a silenced console', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('WHEN an error with a context and a cause is reported', () => {
      beforeEach(() => {
        reportError({
          category: 'permission',
          message: 'denied',
          cause: { code: '42501' },
          context: 'workspace.save',
        });
      });

      test('THEN the console sink logs the contextual label with the message and the cause', () => {
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[permission] workspace.save', 'denied', {
          code: '42501',
        });
      });
    });

    describe('WHEN an error without a context is reported', () => {
      let cause: Error;

      beforeEach(() => {
        cause = new Error('boom');
        reportError({ category: 'unknown', message: 'boom', cause });
      });

      test('THEN the console sink logs the bare category label', () => {
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[unknown]', 'boom', cause);
      });
    });

    describe('WHEN an error without a cause is reported', () => {
      beforeEach(() => {
        reportError({ category: 'network', message: 'offline' });
      });

      test('THEN the console sink logs an empty placeholder instead of the cause', () => {
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[network]', 'offline', '');
      });
    });
  });
});
