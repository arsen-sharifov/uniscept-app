import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspace, TChangePasswordResult } from '@interfaces';

import { TRANSLATIONS } from '@mocks/i18n';
import { router } from '@mocks/navigation';
import { API_FAILURE } from '@mocks/userApi';
import { SHARED_WORKSPACES } from '@mocks/workspace';
import { SecuritySection } from '@/app/platform/components/Settings/fragments';
import { event } from '@/lib/events';

vi.mock('next/navigation', () => import('@mocks/navigation'));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onChangePassword = vi.fn<() => Promise<TChangePasswordResult>>();
const onCheckDeletion = vi.fn<() => Promise<Pick<IWorkspace, 'id' | 'name'>[]>>();
const onDeleteAccount = vi.fn<(password: string) => Promise<void>>();

const renderSection = () =>
  render(
    <SecuritySection
      onChangePassword={onChangePassword}
      onCheckDeletion={onCheckDeletion}
      onDeleteAccount={onDeleteAccount}
    />,
  );

const deleteAccountButton = () =>
  screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.deleteAccount });

describe('SecuritySection', () => {
  describe('GIVEN a filled form whose current password the server rejects', () => {
    beforeEach(() => {
      onChangePassword.mockResolvedValue('incorrectCurrentPassword');
      renderSection();
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword), {
        target: { value: 'old-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
        target: { value: 'new-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
        target: { value: 'new-secret-1' },
      });
    });

    describe('WHEN the password change is submitted', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
        });
      });

      test('THEN the incorrect password is explained and the fields stay filled', () => {
        expect(onChangePassword).toHaveBeenCalledExactlyOnceWith({
          currentPassword: 'old-secret-1',
          newPassword: 'new-secret-1',
        });
        expect(screen.getByText(TRANSLATIONS.platform.settings.security.currentPasswordIncorrect)).toBeInTheDocument();
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword)).toHaveValue(
          'old-secret-1',
        );
        expect(event.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a filled form whose update fails on the api', () => {
    beforeEach(() => {
      onChangePassword.mockRejectedValue(API_FAILURE);
      renderSection();
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword), {
        target: { value: 'old-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
        target: { value: 'new-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
        target: { value: 'new-secret-1' },
      });
    });

    describe('WHEN the password change is submitted', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
        });
      });

      test('THEN the failure is toasted under the update title and nothing shows inline', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(API_FAILURE, {
          title: TRANSLATIONS.platform.settings.security.updateFailed,
          context: 'asyncAction',
        });
        expect(screen.queryByText(TRANSLATIONS.platform.settings.security.updateFailed)).not.toBeInTheDocument();
        expect(
          screen.queryByText(TRANSLATIONS.platform.settings.security.currentPasswordIncorrect),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a filled form the server accepts', () => {
    beforeEach(() => {
      onChangePassword.mockResolvedValue('updated');
      renderSection();
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword), {
        target: { value: 'old-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
        target: { value: 'new-secret-1' },
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
        target: { value: 'new-secret-1' },
      });
    });

    describe('WHEN the password change is submitted', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
        });
      });

      test('THEN the success shows and the fields clear', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.security.passwordUpdated)).toBeInTheDocument();
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword)).toHaveValue('');
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword)).toHaveValue('');
      });
    });
  });

  describe('GIVEN a password form with the current password typed', () => {
    beforeEach(() => {
      renderSection();
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.currentPassword), {
        target: { value: 'old-secret-1' },
      });
    });

    describe('WHEN a too short new password is submitted', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
          target: { value: 'short' },
        });
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
          target: { value: 'short' },
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
      });

      test('THEN the length rule is explained without a request', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.security.passwordTooShort)).toBeInTheDocument();
        expect(onChangePassword).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a confirmation that does not match is submitted', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
          target: { value: 'new-secret-1' },
        });
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
          target: { value: 'new-secret-2' },
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
      });

      test('THEN the mismatch is explained without a request', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.security.passwordMismatch)).toBeInTheDocument();
        expect(onChangePassword).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the current password is submitted as the new one', () => {
      beforeEach(() => {
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.newPassword), {
          target: { value: 'old-secret-1' },
        });
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.confirmPassword), {
          target: { value: 'old-secret-1' },
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.updatePassword }));
      });

      test('THEN the reuse is explained without a request', () => {
        expect(screen.getByText(TRANSLATIONS.platform.settings.security.passwordSame)).toBeInTheDocument();
        expect(onChangePassword).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN the opened account deletion confirmation', () => {
    beforeEach(async () => {
      onCheckDeletion.mockResolvedValue([]);
      onDeleteAccount.mockResolvedValue(undefined);
      renderSection();
      await act(async () => {
        fireEvent.click(deleteAccountButton());
      });
    });

    describe('WHEN it renders', () => {
      test('THEN the shared workspaces were checked once and the deletion waits for the password', () => {
        expect(onCheckDeletion).toHaveBeenCalledTimes(1);
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.deleteButton }),
        ).toBeDisabled();
        expect(screen.queryByText(TRANSLATIONS.platform.settings.security.deleteBlocked)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the password is typed and the deletion is confirmed', () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword), {
          target: { value: 'correct-horse' },
        });
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.deleteButton }));
        });
      });

      test('THEN the account is deleted with that password and the sign-in page opens', () => {
        expect(onDeleteAccount).toHaveBeenCalledExactlyOnceWith('correct-horse');
        expect(router.push).toHaveBeenCalledExactlyOnceWith('/login');
      });
    });

    describe('WHEN a typed password is cancelled and the confirmation reopened', () => {
      beforeEach(async () => {
        fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword), {
          target: { value: 'correct-horse' },
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.cancel }));
        await act(async () => {
          fireEvent.click(deleteAccountButton());
        });
      });

      test('THEN the password field starts empty again', () => {
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword)).toHaveValue('');
        expect(onDeleteAccount).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN an owner whose workspaces other members still use, with a later check that fails', () => {
    beforeEach(() => {
      onCheckDeletion.mockRejectedValue(API_FAILURE).mockResolvedValueOnce(SHARED_WORKSPACES);
      renderSection();
    });

    describe('WHEN the account deletion confirmation is opened', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(deleteAccountButton());
        });
      });

      test('THEN the blocking notice names those workspaces and only cancelling is offered', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.platform.settings.security.deleteBlocked);
        expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Alpha lab', 'Beta guild']);
        expect(screen.queryByLabelText(TRANSLATIONS.platform.settings.security.deletePassword)).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.settings.security.deleteButton }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.cancel })).toBeEnabled();
      });
    });

    describe('WHEN the blocked confirmation is cancelled and reopened', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(deleteAccountButton());
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.cancel }));
        await act(async () => {
          fireEvent.click(deleteAccountButton());
        });
      });

      test('THEN the stale notice is gone and the regular confirmation opens', () => {
        expect(screen.queryByText(TRANSLATIONS.platform.settings.security.deleteBlocked)).not.toBeInTheDocument();
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a shared workspace check that fails on the api', () => {
    beforeEach(() => {
      onCheckDeletion.mockRejectedValue(API_FAILURE);
      renderSection();
    });

    describe('WHEN the account deletion confirmation is opened', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(deleteAccountButton());
        });
      });

      test('THEN the failure is toasted under the load title and the regular confirmation opens', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(API_FAILURE, {
          title: TRANSLATIONS.common.errorTitles.loadFailed,
          context: 'asyncAction',
        });
        expect(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword)).toBeInTheDocument();
        expect(screen.queryByText(TRANSLATIONS.platform.settings.security.deleteBlocked)).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a shared workspace check that is still running', () => {
    beforeEach(() => {
      onCheckDeletion.mockReturnValue(Promise.withResolvers<Pick<IWorkspace, 'id' | 'name'>[]>().promise);
      renderSection();
    });

    describe('WHEN the account deletion is requested', () => {
      beforeEach(() => {
        act(() => {
          fireEvent.click(deleteAccountButton());
        });
      });

      test('THEN the request waits on a disabled button and the confirmation stays closed', () => {
        expect(deleteAccountButton()).toBeDisabled();
        expect(screen.queryByLabelText(TRANSLATIONS.platform.settings.security.deletePassword)).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an account deletion the api rejects', () => {
    beforeEach(async () => {
      onCheckDeletion.mockResolvedValue([]);
      onDeleteAccount.mockRejectedValue(API_FAILURE);
      renderSection();
      await act(async () => {
        fireEvent.click(deleteAccountButton());
      });
      fireEvent.change(screen.getByLabelText(TRANSLATIONS.platform.settings.security.deletePassword), {
        target: { value: 'guess' },
      });
    });

    describe('WHEN the deletion is confirmed', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.settings.security.deleteButton }));
        });
      });

      test('THEN the failure is toasted under the delete title and the account stays open', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(API_FAILURE, {
          title: TRANSLATIONS.platform.settings.security.deleteFailed,
          context: 'asyncAction',
        });
        expect(screen.queryByText(TRANSLATIONS.platform.settings.security.deleteFailed)).not.toBeInTheDocument();
        expect(router.push).not.toHaveBeenCalled();
      });
    });
  });
});
