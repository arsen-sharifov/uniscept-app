import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { MIN_PASSWORD_LENGTH } from '@constants';
import {
  completePasswordReset,
  EXPIRED_RESET,
  PASSWORD_SAVED,
  SAME_PASSWORD_REFUSED,
  UNREACHABLE_RESET,
  VERIFIED_INVITEE_RESET,
  VERIFIED_RESET,
  verifyPasswordReset,
} from '@mocks/authApi';
import { event } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { router, searchParams } from '@mocks/navigation';
import ResetPasswordPage from '@/app/(auth)/reset-password/page';

vi.mock('@api/client', () => import('@mocks/authApi'));
vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const resetForm = (): HTMLFormElement =>
  screen.getByRole('button', { name: TRANSLATIONS.auth.resetPassword.submit }).closest('form')!;

const passwordInput = (): HTMLElement => screen.getByLabelText(TRANSLATIONS.auth.resetPassword.password);

const confirmationInput = (): HTMLElement => screen.getByLabelText(TRANSLATIONS.auth.resetPassword.confirmPassword);

afterEach(() => {
  cleanup();
  searchParams.delete('token_hash');
  window.history.replaceState(null, '', '/');
});

describe('ResetPasswordPage', () => {
  describe('GIVEN the page opened without a token', () => {
    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(<ResetPasswordPage />);
      });

      test('THEN it explains that the link cannot be used and offers a new one', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.auth.resetPassword.rejected);
        expect(screen.getByRole('link', { name: TRANSLATIONS.auth.resetPassword.requestNew })).toHaveAttribute(
          'href',
          '/forgot-password',
        );
        expect(screen.queryByLabelText(TRANSLATIONS.auth.resetPassword.password)).toBeNull();
      });
    });
  });

  describe('GIVEN the page opened from an emailed link', () => {
    beforeEach(() => {
      searchParams.set('token_hash', 'hash-1');
      window.history.replaceState(null, '', '/reset-password?token_hash=hash-1');
      completePasswordReset.mockResolvedValue(PASSWORD_SAVED);
      render(<ResetPasswordPage />);
    });

    describe('WHEN it renders', () => {
      test('THEN the form asks for a password as long as at sign-up without using the link yet', () => {
        expect(passwordInput()).toHaveAttribute('minLength', String(MIN_PASSWORD_LENGTH));
        expect(confirmationInput()).toHaveAttribute('minLength', String(MIN_PASSWORD_LENGTH));
        expect(verifyPasswordReset).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the two passwords differ', () => {
      beforeEach(async () => {
        fireEvent.change(passwordInput(), { target: { value: 'new-secret-1' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret-2' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the mismatch is shown and the link is kept for another try', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.auth.resetPassword.passwordMismatch);
        expect(verifyPasswordReset).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a new password is saved with a valid link', () => {
      beforeEach(async () => {
        verifyPasswordReset.mockResolvedValue(VERIFIED_RESET);
        fireEvent.change(passwordInput(), { target: { value: 'new-secret' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the link is used once and the new password is saved', () => {
        expect(verifyPasswordReset).toHaveBeenCalledExactlyOnceWith('hash-1');
        expect(completePasswordReset).toHaveBeenCalledExactlyOnceWith('new-secret');
      });

      test('THEN the token leaves the address bar', () => {
        expect(window.location.search).toBe('');
      });

      test('THEN the person is told and lands signed in on the platform', () => {
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.auth.resetPassword.updated);
        expect(router.replace).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });

    describe('WHEN the link turns out to be used or expired', () => {
      beforeEach(async () => {
        verifyPasswordReset.mockResolvedValue(EXPIRED_RESET);
        fireEvent.change(passwordInput(), { target: { value: 'new-secret' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the form gives way to the expired link notice with a way to request a new one', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.auth.resetPassword.rejected);
        expect(screen.getByRole('link', { name: TRANSLATIONS.auth.resetPassword.requestNew })).toBeVisible();
        expect(screen.queryByLabelText(TRANSLATIONS.auth.resetPassword.password)).toBeNull();
      });

      test('THEN nothing is saved and the rejection is logged without a toast', () => {
        expect(completePasswordReset).not.toHaveBeenCalled();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(EXPIRED_RESET.error, {
          toast: false,
          context: 'auth.verifyPasswordReset',
        });
      });
    });

    describe('WHEN the link cannot be checked because the auth server is unreachable', () => {
      beforeEach(async () => {
        verifyPasswordReset.mockResolvedValue(UNREACHABLE_RESET);
        fireEvent.change(passwordInput(), { target: { value: 'new-secret' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the failure is reported and the form stays for another try', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(UNREACHABLE_RESET.error, {
          title: TRANSLATIONS.auth.errors.resetFailed,
          context: 'auth.verifyPasswordReset',
        });
        expect(completePasswordReset).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.resetPassword.submit })).toBeEnabled();
      });
    });

    describe('WHEN the link belongs to an invited teammate who never finished the account', () => {
      beforeEach(async () => {
        verifyPasswordReset.mockResolvedValue(VERIFIED_INVITEE_RESET);
        fireEvent.change(passwordInput(), { target: { value: 'new-secret' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the account setup takes over instead of saving only a password', () => {
        expect(router.replace).toHaveBeenCalledExactlyOnceWith('/join');
        expect(completePasswordReset).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a used link whose first new password was refused as unchanged', () => {
    beforeEach(async () => {
      searchParams.set('token_hash', 'hash-2');
      verifyPasswordReset.mockResolvedValue(VERIFIED_RESET);
      completePasswordReset.mockResolvedValueOnce(SAME_PASSWORD_REFUSED).mockResolvedValue(PASSWORD_SAVED);
      render(<ResetPasswordPage />);
      fireEvent.change(passwordInput(), { target: { value: 'old-secret' } });
      fireEvent.change(confirmationInput(), { target: { value: 'old-secret' } });
      await act(async () => {
        fireEvent.submit(resetForm());
      });
    });

    describe('WHEN the refusal is shown', () => {
      test('THEN it is reported and the form stays open', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(SAME_PASSWORD_REFUSED.error, {
          title: TRANSLATIONS.auth.errors.resetFailed,
          context: 'auth.completePasswordReset',
        });
        expect(router.replace).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.resetPassword.submit })).toBeEnabled();
      });
    });

    describe('WHEN a different password is submitted', () => {
      beforeEach(async () => {
        fireEvent.change(passwordInput(), { target: { value: 'new-secret' } });
        fireEvent.change(confirmationInput(), { target: { value: 'new-secret' } });
        await act(async () => {
          fireEvent.submit(resetForm());
        });
      });

      test('THEN the link is not used again and the new password is saved', () => {
        expect(verifyPasswordReset).toHaveBeenCalledOnce();
        expect(completePasswordReset.mock.calls).toEqual([['old-secret'], ['new-secret']]);
        expect(router.replace).toHaveBeenCalledExactlyOnceWith('/platform');
      });
    });
  });
});
