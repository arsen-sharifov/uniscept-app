import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getSession, sessionOf, signIn } from '@mocks/authApi';
import { event } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { router, searchParams } from '@mocks/navigation';
import LoginPage from '@/app/(auth)/login/page';

vi.mock('@api/client', () => import('@mocks/authApi'));
vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const loginForm = (): HTMLFormElement =>
  screen.getByRole('button', { name: TRANSLATIONS.auth.signIn.submit }).closest('form')!;

afterEach(() => {
  cleanup();
  searchParams.delete('emailSent');
  searchParams.delete('error');
  vi.useRealTimers();
});

describe('LoginPage', () => {
  describe('GIVEN a visitor with filled credentials', () => {
    beforeEach(() => {
      render(<LoginPage />);
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.auth.signIn.email), { target: { value: 'ada@example.com' } });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.auth.signIn.password), { target: { value: 'secret-pass' } });
    });

    describe('WHEN the credentials are accepted', () => {
      beforeEach(async () => {
        signIn.mockResolvedValue({ error: null });
        await act(async () => {
          fireEvent.submit(loginForm());
        });
      });

      test('THEN the platform opens', () => {
        expect(signIn).toHaveBeenCalledExactlyOnceWith('ada@example.com', 'secret-pass');
        expect(router.push).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });

    describe('WHEN the credentials are rejected', () => {
      const authError = new Error('Invalid login credentials');

      beforeEach(async () => {
        signIn.mockResolvedValue({ error: authError });
        await act(async () => {
          fireEvent.submit(loginForm());
        });
      });

      test('THEN the failure is reported and the form can be submitted again', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(authError, {
          title: TRANSLATIONS.auth.errors.signInFailed,
          context: 'auth.signIn',
        });
        expect(router.push).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.signIn.submit })).toBeEnabled();
      });
    });
  });

  describe('GIVEN a visitor waiting for the sign-up confirmation email', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      searchParams.set('emailSent', 'true');
      getSession.mockResolvedValueOnce(sessionOf(null)).mockResolvedValue(sessionOf({ id: 'user-1' }));
      render(<LoginPage />);
    });

    describe('WHEN the first check finds no session yet', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2000);
        });
      });

      test('THEN the notice stays and the platform does not open', () => {
        expect(screen.getByText(TRANSLATIONS.auth.signIn.emailSent)).toBeVisible();
        expect(router.push).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the email is confirmed in another tab before a later check', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(6000);
        });
      });

      test('THEN the platform opens once the session appears and the checks stop', () => {
        expect(getSession).toHaveBeenCalledTimes(2);
        expect(router.push).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });
  });

  describe('GIVEN a visitor sent back from an expired confirmation or invitation link', () => {
    beforeEach(() => {
      searchParams.set('error', 'invalid_code');
    });

    describe('WHEN the sign-in page opens', () => {
      beforeEach(() => {
        render(<LoginPage />);
      });

      test('THEN the invalid link notice is announced above the form', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.auth.signIn.invalidLink);
      });
    });
  });

  describe('GIVEN a visitor opening the sign-in page directly', () => {
    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<LoginPage />);
      });

      test('THEN no link notice is shown', () => {
        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.queryByText(TRANSLATIONS.auth.signIn.emailSent)).toBeNull();
      });
    });
  });
});
