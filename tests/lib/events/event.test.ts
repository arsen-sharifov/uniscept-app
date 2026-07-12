import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TOAST_DEFAULT_DURATION_MS, TOAST_ERROR_DURATION_MS } from '@constants';
import { event, useToastStore } from '@/lib/events';

afterEach(() => {
  useToastStore.getState().clear();
  vi.restoreAllMocks();
});

describe('event', () => {
  describe('GIVEN an empty toast store', () => {
    describe('WHEN a success event is raised', () => {
      beforeEach(() => {
        event.success('Saved');
      });

      test('THEN a success toast with the default duration appears', () => {
        expect(useToastStore.getState().toasts).toEqual([
          expect.objectContaining({ type: 'success', message: 'Saved', duration: TOAST_DEFAULT_DURATION_MS }),
        ]);
      });
    });

    describe('WHEN an info event is raised', () => {
      beforeEach(() => {
        event.info('Heads up');
      });

      test('THEN an info toast with the default duration appears', () => {
        expect(useToastStore.getState().toasts).toEqual([
          expect.objectContaining({ type: 'info', message: 'Heads up', duration: TOAST_DEFAULT_DURATION_MS }),
        ]);
      });
    });

    describe('WHEN a success event is raised with a custom title', () => {
      beforeEach(() => {
        event.success('Saved', { title: 'All good' });
      });

      test('THEN the toast carries the title', () => {
        expect(useToastStore.getState().toasts).toEqual([
          expect.objectContaining({ type: 'success', title: 'All good' }),
        ]);
      });
    });

    describe('WHEN a warning event is raised with a custom duration', () => {
      beforeEach(() => {
        event.warning('Careful', { duration: 1234 });
      });

      test('THEN the override wins', () => {
        expect(useToastStore.getState().toasts).toEqual([expect.objectContaining({ type: 'warning', duration: 1234 })]);
      });
    });
  });

  describe('GIVEN a failing backend call', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('WHEN the error event is raised', () => {
      let normalized: ReturnType<typeof event.error>;

      beforeEach(() => {
        normalized = event.error({ code: '42501', message: 'denied' }, { context: 'workspace.save' });
      });

      test('THEN the error is reported to the console sink with its context', () => {
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[permission] workspace.save', 'denied', {
          code: '42501',
          message: 'denied',
        });
      });

      test('THEN an error toast with the longer duration appears', () => {
        expect(useToastStore.getState().toasts).toEqual([
          expect.objectContaining({ errorCategory: 'permission', duration: TOAST_ERROR_DURATION_MS }),
        ]);
      });

      test('THEN the normalized error is returned', () => {
        expect(normalized).toMatchObject({ category: 'permission', message: 'denied', context: 'workspace.save' });
      });
    });

    describe('WHEN the error event is raised with the toast disabled', () => {
      beforeEach(() => {
        event.error(new Error('silent'), { toast: false });
      });

      test('THEN the console sink still fires but no toast appears', () => {
        expect(console.error).toHaveBeenCalledTimes(1);
        expect(useToastStore.getState().toasts).toEqual([]);
      });
    });

    describe('WHEN the error event is raised with a custom title', () => {
      beforeEach(() => {
        event.error(new Error('boom'), { title: 'Saving failed' });
      });

      test('THEN the toast carries the title', () => {
        expect(useToastStore.getState().toasts).toEqual([expect.objectContaining({ title: 'Saving failed' })]);
      });
    });

    describe('WHEN the error event is raised with a custom duration', () => {
      beforeEach(() => {
        event.error(new Error('boom'), { duration: 250 });
      });

      test('THEN the override wins over the error default', () => {
        expect(useToastStore.getState().toasts).toEqual([expect.objectContaining({ duration: 250 })]);
      });
    });

    describe('WHEN the error event is raised without a context', () => {
      let cause: Error;

      beforeEach(() => {
        cause = new Error('boom');
        event.error(cause, { toast: false });
      });

      test('THEN the sink logs the bare category with the cause', () => {
        expect(console.error).toHaveBeenCalledExactlyOnceWith('[unknown]', 'boom', cause);
      });
    });
  });
});
