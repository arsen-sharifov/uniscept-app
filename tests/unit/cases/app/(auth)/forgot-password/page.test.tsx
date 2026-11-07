import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PASSWORD_RESET_REQUEST_COOKIE } from '@constants';
import { PENDING_RESET, RESET_CLOCK, RESET_REQUEST_COOKIE_VALUE } from '@mocks/authApi';
import { translate, TRANSLATIONS } from '@mocks/i18n';
import { cookieStore } from '@mocks/nextHeaders';
import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';

vi.mock('next/headers', () => import('@mocks/nextHeaders'));
vi.mock('@api/client', () => import('@mocks/authApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ForgotPasswordPage', () => {
  describe('GIVEN a reset request made less than a minute before the page is reloaded', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      cookieStore.get.mockReturnValue({ name: PASSWORD_RESET_REQUEST_COOKIE, value: RESET_REQUEST_COOKIE_VALUE });
    });

    describe('WHEN the page renders on the server', () => {
      beforeEach(async () => {
        render(await ForgotPasswordPage());
      });

      test('THEN the remembered request is read from its cookie', () => {
        expect(cookieStore.get).toHaveBeenCalledExactlyOnceWith(PASSWORD_RESET_REQUEST_COOKIE);
      });

      test('THEN the notice and the remaining countdown are rendered instead of the form', () => {
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: 'ada@example.com' }),
        );
        expect(screen.getByRole('button')).toHaveTextContent(
          translate('auth.forgotPassword.resendIn', { seconds: PENDING_RESET.secondsLeft }),
        );
      });
    });
  });

  describe('GIVEN no remembered request', () => {
    beforeEach(() => {
      cookieStore.get.mockReturnValue(undefined);
    });

    describe('WHEN the page renders on the server', () => {
      beforeEach(async () => {
        render(await ForgotPasswordPage());
      });

      test('THEN the form is rendered', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.forgotPassword.submit })).toBeEnabled();
      });
    });
  });
});
