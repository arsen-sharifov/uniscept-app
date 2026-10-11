import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TOAST_EXIT_FALLBACK_MS } from '@constants';
import { TOAST_DURATION_MS, SAVED_TOAST } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { ToastItem } from '@/components/Toast/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onDismiss = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ToastItem', () => {
  describe('GIVEN a titled success toast', () => {
    beforeEach(() => {
      render(<ToastItem toast={SAVED_TOAST} onDismiss={onDismiss} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is announced politely with its title and message', () => {
        const toast = screen.getByRole('status');

        expect(toast).toHaveAttribute('aria-live', 'polite');
        expect(toast).toHaveTextContent('Saved');
        expect(toast).toHaveTextContent('The thread is saved.');
      });
    });

    describe('WHEN its duration and the exit fallback pass', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS));
        act(() => vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS));
      });

      test('THEN it dismisses itself by id', () => {
        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
      });
    });

    describe('WHEN its duration passes and its exit transition ends', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS));
        fireEvent.transitionEnd(screen.getByRole('status'));
      });

      test('THEN it is dismissed without waiting for the fallback', () => {
        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
      });
    });

    describe('WHEN a transition ends while it is still showing', () => {
      beforeEach(() => {
        fireEvent.transitionEnd(screen.getByRole('status'));
      });

      test('THEN it stays', () => {
        expect(onDismiss).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the close button is pressed and a transition of an inner element ends', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.common.close }));
        fireEvent.transitionEnd(screen.getByRole('button', { name: TRANSLATIONS.common.close }));
      });

      test('THEN only its own exit counts and it waits for that', () => {
        expect(onDismiss).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the close button is pressed and the exit fallback passes', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.common.close }));
        act(() => vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS));
      });

      test('THEN it is dismissed before its duration is over', () => {
        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
      });
    });

    describe('WHEN the pointer rests on it past its duration', () => {
      beforeEach(() => {
        fireEvent.mouseEnter(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 3));
      });

      test('THEN it stays', () => {
        expect(onDismiss).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the pointer rests on it two seconds in, leaves, and the rest of its time passes', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(2000));
        fireEvent.mouseEnter(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 3));
        fireEvent.mouseLeave(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 2000));
        act(() => vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS));
      });

      test('THEN it dismisses itself on the time it had left', () => {
        expect(onDismiss).toHaveBeenCalledExactlyOnceWith('toast-1');
      });
    });

    describe('WHEN the pointer rests on it two seconds in, leaves, and the rest of its time passes but for a moment', () => {
      beforeEach(() => {
        act(() => vi.advanceTimersByTime(2000));
        fireEvent.mouseEnter(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 3));
        fireEvent.mouseLeave(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS - 2000 - 1));
        act(() => vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS));
      });

      test('THEN it is not dismissed early', () => {
        expect(onDismiss).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the pointer leaves while focus stays inside past its duration', () => {
      beforeEach(() => {
        fireEvent.focus(screen.getByRole('button', { name: TRANSLATIONS.common.close }));
        fireEvent.mouseEnter(screen.getByRole('status'));
        fireEvent.mouseLeave(screen.getByRole('status'));
        act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 3));
      });

      test('THEN it stays until focus leaves too', () => {
        expect(onDismiss).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an error toast without a title', () => {
    beforeEach(() => {
      render(<ToastItem toast={{ id: 'toast-2', errorCategory: 'network', duration: 8000 }} onDismiss={onDismiss} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is announced assertively with the message of its category', () => {
        const alert = screen.getByRole('alert');

        expect(alert).toHaveAttribute('aria-live', 'assertive');
        expect(alert).toHaveTextContent(TRANSLATIONS.common.errors.network);
      });
    });
  });
});
