import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PASSWORD_RESET_RESEND_WINDOW_MS, PASSWORD_RESET_RESEND_WINDOW_SECONDS } from '@constants';
import {
  ELAPSED_COOLDOWN_SECONDS,
  EXPIRED_RESET_REQUEST,
  PENDING_RESET,
  REMEMBERED_RESET_REQUEST,
  requestPasswordReset,
  RESET_CLOCK,
  RESET_REQUEST_FAILED,
} from '@mocks/authApi';
import { event } from '@mocks/events';
import { translate, TRANSLATIONS } from '@mocks/i18n';
import { ForgotPasswordFlow } from '@/app/(auth)/fragments';
import { useAuthFlowStore } from '@/lib/stores';

vi.mock('@api/client', () => import('@mocks/authApi'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const requestForm = (): HTMLFormElement =>
  screen.getByRole('button', { name: TRANSLATIONS.auth.forgotPassword.submit }).closest('form')!;

const emailInput = (): HTMLElement => screen.getByLabelText(TRANSLATIONS.auth.forgotPassword.email);

const resendButton = (): HTMLElement => screen.getByRole('button');

afterEach(() => {
  cleanup();
  useAuthFlowStore.getState().reset();
  vi.useRealTimers();
});

describe('ForgotPasswordFlow', () => {
  describe('GIVEN a visitor who typed an email', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      render(<ForgotPasswordFlow pendingRequest={null} />);
      fireEvent.change(emailInput(), { target: { value: ' ada@example.com ' } });
    });

    describe('WHEN the request is accepted', () => {
      beforeEach(async () => {
        requestPasswordReset.mockResolvedValue('sent');
        await act(async () => {
          fireEvent.submit(requestForm());
        });
      });

      test('THEN the link is requested for the trimmed email', () => {
        expect(requestPasswordReset).toHaveBeenCalledExactlyOnceWith('ada@example.com');
      });

      test('THEN the browser remembers the request until the pause is over', () => {
        expect(useAuthFlowStore.getState().resetRequest).toEqual({
          email: 'ada@example.com',
          resendAt: RESET_CLOCK + PASSWORD_RESET_RESEND_WINDOW_MS,
        });
      });

      test('THEN the same notice is shown whether or not an account exists', () => {
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: 'ada@example.com' }),
        );
        expect(screen.getByRole('heading', { name: TRANSLATIONS.auth.forgotPassword.sentHeading })).toBeVisible();
        expect(event.success).not.toHaveBeenCalled();
      });

      test('THEN sending again waits out the pause the mail server keeps between links', () => {
        expect(resendButton()).toBeDisabled();
        expect(resendButton()).toHaveTextContent(
          translate('auth.forgotPassword.resendIn', { seconds: PASSWORD_RESET_RESEND_WINDOW_SECONDS }),
        );
      });

      test('THEN the visitor can go back to sign in', () => {
        expect(screen.getByRole('link', { name: TRANSLATIONS.auth.forgotPassword.backToSignIn })).toHaveAttribute(
          'href',
          '/login',
        );
      });
    });

    describe('WHEN the server says a link was asked for too recently', () => {
      beforeEach(async () => {
        requestPasswordReset.mockResolvedValue('throttled');
        await act(async () => {
          fireEvent.submit(requestForm());
        });
      });

      test('THEN the same notice and the paused button are shown instead of an error', () => {
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: 'ada@example.com' }),
        );
        expect(resendButton()).toBeDisabled();
        expect(event.error).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the request fails on the server', () => {
      beforeEach(async () => {
        requestPasswordReset.mockRejectedValue(RESET_REQUEST_FAILED);
        await act(async () => {
          fireEvent.submit(requestForm());
        });
      });

      test('THEN the failure is reported and the form can be submitted again', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(RESET_REQUEST_FAILED, {
          title: TRANSLATIONS.auth.errors.resetRequestFailed,
          context: 'auth.requestPasswordReset',
        });
        expect(screen.queryByRole('status')).toBeNull();
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.forgotPassword.submit })).toBeEnabled();
      });
    });
  });

  describe('GIVEN an email typed on the sign-in page before following the link', () => {
    beforeEach(() => {
      useAuthFlowStore.getState().setDraftEmail('ada@example.com');
    });

    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={null} />);
      });

      test('THEN the email is already filled in', () => {
        expect(emailInput()).toHaveValue('ada@example.com');
      });

      test('THEN the handed over email is not kept for later visits', () => {
        expect(useAuthFlowStore.getState().draftEmail).toBe('');
      });
    });
  });

  describe('GIVEN a request still pausing when the page is loaded again', () => {
    describe('WHEN the page opens with the request the server remembered', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={PENDING_RESET} />);
      });

      test('THEN the notice stays and the countdown goes on from where it was', () => {
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: PENDING_RESET.email }),
        );
        expect(resendButton()).toBeDisabled();
        expect(resendButton()).toHaveTextContent(
          translate('auth.forgotPassword.resendIn', { seconds: PENDING_RESET.secondsLeft }),
        );
      });
    });
  });

  describe('GIVEN a request remembered in the browser before going back to the page', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      useAuthFlowStore.getState().rememberResetRequest(REMEMBERED_RESET_REQUEST);
    });

    describe('WHEN the page opens from the browser history without the server', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={null} />);
      });

      test('THEN the notice and the remaining countdown come back', () => {
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: REMEMBERED_RESET_REQUEST.email }),
        );
        expect(resendButton()).toHaveTextContent(
          translate('auth.forgotPassword.resendIn', { seconds: PENDING_RESET.secondsLeft }),
        );
      });
    });
  });

  describe('GIVEN an answer of the server shown after a reload and nothing remembered yet', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
    });

    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={PENDING_RESET} />);
      });

      test('THEN the browser remembers when the pause ends for later visits through the history', () => {
        expect(useAuthFlowStore.getState().resetRequest).toEqual({
          email: PENDING_RESET.email,
          resendAt: RESET_CLOCK + PENDING_RESET.secondsLeft * 1000,
        });
      });
    });
  });

  describe('GIVEN a pause that ended while the page was away and the stale server answer of the history', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      useAuthFlowStore.getState().rememberResetRequest(EXPIRED_RESET_REQUEST);
    });

    describe('WHEN the page opens again through the browser history', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={PENDING_RESET} />);
      });

      test('THEN the form is shown instead of the old countdown', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.forgotPassword.submit })).toBeEnabled();
        expect(screen.queryByRole('status')).toBeNull();
      });
    });
  });

  describe('GIVEN a pending request and another email typed on the sign-in page', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      useAuthFlowStore.getState().rememberResetRequest(REMEMBERED_RESET_REQUEST);
      useAuthFlowStore.getState().setDraftEmail('grace@example.com');
    });

    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={null} />);
      });

      test('THEN the form is shown with the typed email instead of the old notice', () => {
        expect(emailInput()).toHaveValue('grace@example.com');
        expect(screen.queryByRole('status')).toBeNull();
      });
    });
  });

  describe('GIVEN a remembered request whose pause is already over', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(RESET_CLOCK);
      useAuthFlowStore.getState().rememberResetRequest(EXPIRED_RESET_REQUEST);
    });

    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={null} />);
      });

      test('THEN the form is shown for a new request', () => {
        expect(screen.getByRole('button', { name: TRANSLATIONS.auth.forgotPassword.submit })).toBeEnabled();
        expect(screen.queryByRole('status')).toBeNull();
      });
    });
  });

  describe('GIVEN a visitor who was told the link is on its way', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      requestPasswordReset.mockResolvedValue('sent');
      render(<ForgotPasswordFlow pendingRequest={null} />);
      fireEvent.change(emailInput(), { target: { value: 'ada@example.com' } });
      await act(async () => {
        fireEvent.submit(requestForm());
      });
    });

    describe('WHEN part of the pause has passed', () => {
      beforeEach(() => {
        act(() => {
          vi.advanceTimersByTime(ELAPSED_COOLDOWN_SECONDS * 1000);
        });
      });

      test('THEN the button counts down the seconds that are left', () => {
        expect(resendButton()).toBeDisabled();
        expect(resendButton()).toHaveTextContent(
          translate('auth.forgotPassword.resendIn', {
            seconds: PASSWORD_RESET_RESEND_WINDOW_SECONDS - ELAPSED_COOLDOWN_SECONDS,
          }),
        );
      });
    });

    describe('WHEN the pause is over', () => {
      beforeEach(() => {
        act(() => {
          vi.advanceTimersByTime(PASSWORD_RESET_RESEND_WINDOW_MS);
        });
      });

      test('THEN the link can be sent again', () => {
        expect(resendButton()).toBeEnabled();
        expect(resendButton()).toHaveTextContent(TRANSLATIONS.auth.forgotPassword.resend);
      });
    });

    describe('WHEN the link is sent again after the pause', () => {
      beforeEach(async () => {
        act(() => {
          vi.advanceTimersByTime(PASSWORD_RESET_RESEND_WINDOW_MS);
        });
        await act(async () => {
          fireEvent.click(resendButton());
        });
      });

      test('THEN a second link is requested for the same email', () => {
        expect(requestPasswordReset.mock.calls).toEqual([['ada@example.com'], ['ada@example.com']]);
      });

      test('THEN the visitor is told the request went out again and the pause starts over', () => {
        expect(event.success).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.auth.forgotPassword.resent);
        expect(resendButton()).toBeDisabled();
      });
    });

    describe('WHEN sending again after the pause is throttled by the server', () => {
      beforeEach(async () => {
        requestPasswordReset.mockResolvedValue('throttled');
        act(() => {
          vi.advanceTimersByTime(PASSWORD_RESET_RESEND_WINDOW_MS);
        });
        await act(async () => {
          fireEvent.click(resendButton());
        });
      });

      test('THEN no confirmation and no error are shown and the pause starts over', () => {
        expect(event.success).not.toHaveBeenCalled();
        expect(event.error).not.toHaveBeenCalled();
        expect(screen.getByRole('status')).toHaveTextContent(
          translate('auth.forgotPassword.sent', { email: 'ada@example.com' }),
        );
        expect(resendButton()).toBeDisabled();
      });
    });

    describe('WHEN sending again after the pause fails on the server', () => {
      beforeEach(async () => {
        requestPasswordReset.mockRejectedValue(RESET_REQUEST_FAILED);
        act(() => {
          vi.advanceTimersByTime(PASSWORD_RESET_RESEND_WINDOW_MS);
        });
        await act(async () => {
          fireEvent.click(resendButton());
        });
      });

      test('THEN the failure is reported instead of a confirmation and the link can be asked for again', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(RESET_REQUEST_FAILED, {
          title: TRANSLATIONS.auth.errors.resetRequestFailed,
          context: 'auth.requestPasswordReset',
        });
        expect(event.success).not.toHaveBeenCalled();
        expect(resendButton()).toBeEnabled();
      });
    });
  });

  describe('GIVEN a visitor who remembered the password', () => {
    describe('WHEN the page opens', () => {
      beforeEach(() => {
        render(<ForgotPasswordFlow pendingRequest={null} />);
      });

      test('THEN a way back to sign in is offered', () => {
        expect(screen.getByRole('link', { name: TRANSLATIONS.auth.signUp.signInLink })).toHaveAttribute(
          'href',
          '/login',
        );
      });
    });
  });
});
