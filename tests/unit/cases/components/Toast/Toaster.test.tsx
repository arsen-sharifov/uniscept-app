import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { TOAST_EXIT_FALLBACK_MS } from '@constants';
import { TRANSLATIONS } from '@mocks/i18n';
import { Toaster } from '@/components/Toast';
import { useToastStore } from '@/lib/events';

vi.mock('@/i18n', () => import('@mocks/i18n'));

afterEach(() => {
  useToastStore.getState().clear();
  vi.useRealTimers();
});

describe('Toaster', () => {
  describe('GIVEN two toasts raised one after another', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      useToastStore.getState().add({ type: 'info', message: 'First', duration: 5000 });
      useToastStore.getState().add({ type: 'success', message: 'Second', duration: 5000 });
      render(<Toaster />);
    });

    describe('WHEN it renders', () => {
      test('THEN the notifications region shows the newest on top', () => {
        const region = screen.getByRole('region', { name: TRANSLATIONS.common.notifications });

        expect(
          within(region)
            .getAllByRole('status')
            .map((toast) => toast.textContent),
        ).toEqual(['Second', 'First']);
      });
    });

    describe('WHEN the newest is closed and its exit fallback passes', () => {
      beforeEach(() => {
        fireEvent.click(screen.getAllByRole('button', { name: TRANSLATIONS.common.close })[0]!);
        act(() => vi.advanceTimersByTime(TOAST_EXIT_FALLBACK_MS));
      });

      test('THEN it leaves the store and only the other one is shown', () => {
        expect(useToastStore.getState().toasts).toEqual([expect.objectContaining({ message: 'First' })]);
        expect(screen.getAllByRole('status').map((toast) => toast.textContent)).toEqual(['First']);
      });
    });
  });

  describe('GIVEN no toasts', () => {
    describe('WHEN a toast is raised after it mounted', () => {
      beforeEach(() => {
        render(<Toaster />);
        act(() => {
          useToastStore.getState().add({ type: 'warning', message: 'Careful', duration: 5000 });
        });
      });

      test('THEN it appears in the notifications region', () => {
        expect(
          within(screen.getByRole('region', { name: TRANSLATIONS.common.notifications })).getByRole('status'),
        ).toHaveTextContent('Careful');
      });
    });
  });

  describe('GIVEN a raised toast during a server render', () => {
    let markup: string;

    beforeEach(() => {
      useToastStore.getState().add({ type: 'info', message: 'First', duration: 5000 });
    });

    describe('WHEN the toaster renders on the server', () => {
      beforeEach(() => {
        markup = renderToString(<Toaster />);
      });

      test('THEN it renders nothing until it can portal into the page', () => {
        expect(markup).toBe('');
      });
    });
  });
});
