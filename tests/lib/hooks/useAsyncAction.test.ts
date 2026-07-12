import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SUCCESS_RESET_DELAY_MS } from '@constants';
import { useAsyncAction } from '@hooks';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useAsyncAction', () => {
  describe('GIVEN a succeeding action', () => {
    describe('WHEN it is still running', () => {
      test('THEN loading is on', async () => {
        const { result } = renderHook(() => useAsyncAction());
        const gate = Promise.withResolvers<void>();
        let pending: Promise<void> = Promise.resolve();

        act(() => {
          pending = result.current.run(() => gate.promise, 'failed');
        });

        expect(result.current).toMatchObject({ loading: true, success: false, error: null });

        gate.resolve();
        await act(async () => pending);
      });
    });

    describe('WHEN it runs', () => {
      test('THEN success turns on and loading settles', async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () => result.current.run(async () => {}, 'failed'));

        expect(result.current).toMatchObject({ loading: false, success: true, error: null });
      });
    });

    describe('WHEN the success reset delay elapses', () => {
      test('THEN success turns off', async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () => result.current.run(async () => {}, 'failed'));
        act(() => {
          vi.advanceTimersByTime(SUCCESS_RESET_DELAY_MS);
        });

        expect(result.current.success).toBe(false);
      });
    });

    describe('WHEN it runs again before the success reset elapses', () => {
      test('THEN the reset timer restarts', async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () => result.current.run(async () => {}, 'failed'));
        act(() => {
          vi.advanceTimersByTime(SUCCESS_RESET_DELAY_MS - 1);
        });
        await act(async () => result.current.run(async () => {}, 'failed'));
        act(() => {
          vi.advanceTimersByTime(SUCCESS_RESET_DELAY_MS - 1);
        });

        expect(result.current.success).toBe(true);

        act(() => {
          vi.advanceTimersByTime(1);
        });

        expect(result.current.success).toBe(false);
      });
    });

    describe('WHEN the hook unmounts after the success', () => {
      test('THEN the reset timer is cleared', async () => {
        const view = renderHook(() => useAsyncAction());

        await act(async () => view.result.current.run(async () => {}, 'failed'));

        expect(vi.getTimerCount()).toBe(1);

        view.unmount();

        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('GIVEN a failing action', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('WHEN it runs with a static message', () => {
      test('THEN the message lands in the error state', async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () =>
          result.current.run(async () => {
            throw new Error('boom');
          }, 'Saving failed'),
        );

        expect(result.current).toMatchObject({ loading: false, success: false, error: 'Saving failed' });
      });
    });

    describe('WHEN it runs with a message factory', () => {
      test('THEN the factory receives the cause', async () => {
        const { result } = renderHook(() => useAsyncAction());

        await act(async () =>
          result.current.run(
            async () => {
              throw new Error('boom');
            },
            (cause) => `wrapped: ${(cause as Error).message}`,
          ),
        );

        expect(result.current.error).toBe('wrapped: boom');
      });
    });
  });
});
