'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { MIN_PASSWORD_LENGTH } from '@constants';
import { useAsyncAction, useTranslations } from '@hooks';

import { SettingsInput } from '../SettingsInput';
import { SettingsPrimaryButton } from '../SettingsPrimaryButton';

export interface ISecuritySectionProps {
  onChangePassword: (password: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export const SecuritySection = ({ onChangePassword, onDeleteAccount }: ISecuritySectionProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { security } = t.platform.settings;
  const id = useId();
  const newPasswordId = `${id}-new`;
  const confirmPasswordId = `${id}-confirm`;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordAction = useAsyncAction();
  const deleteAction = useAsyncAction();

  const handleChangePassword = () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      passwordAction.setError(security.passwordTooShort);

      return;
    }

    if (newPassword !== confirmPassword) {
      passwordAction.setError(security.passwordMismatch);

      return;
    }

    passwordAction.run(async () => {
      await onChangePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }, security.updateFailed);
  };

  const handleDelete = () => {
    deleteAction.run(async () => {
      await onDeleteAccount();
      router.push('/login');
    }, security.deleteFailed);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-medium tracking-wider text-[color:var(--text-subtle)] uppercase">
          {security.changePassword}
        </h3>
        <div className="max-w-sm space-y-3">
          <div>
            <label htmlFor={newPasswordId} className="sr-only">
              {security.newPassword}
            </label>
            <SettingsInput
              id={newPasswordId}
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              placeholder={security.newPassword}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={confirmPasswordId} className="sr-only">
              {security.confirmPassword}
            </label>
            <SettingsInput
              id={confirmPasswordId}
              type="password"
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              placeholder={security.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {passwordAction.error && <p className="text-sm text-[color:var(--status-error)]">{passwordAction.error}</p>}

          <div className="flex items-center gap-3">
            <SettingsPrimaryButton
              onClick={handleChangePassword}
              disabled={passwordAction.loading || !newPassword || !confirmPassword}
            >
              {passwordAction.loading ? security.updatingPassword : security.updatePassword}
            </SettingsPrimaryButton>
            {passwordAction.success && (
              <span className="text-sm text-[color:var(--accent-strong)]">{security.passwordUpdated}</span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] pt-6">
        <h3 className="mb-3 text-xs font-medium tracking-wider text-[color:var(--status-error)]/70 uppercase">
          {security.dangerZone}
        </h3>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-sm text-[color:var(--status-error)]">{security.deleteConfirm}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteAction.loading}
                className="cursor-pointer rounded-xl bg-[color:var(--status-error)] px-5 py-2 text-sm font-medium text-[color:var(--on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteAction.loading ? security.deleting : security.deleteButton}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="cursor-pointer rounded-xl bg-[color:var(--surface-overlay)] px-5 py-2 text-sm font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--border)]"
              >
                {security.cancel}
              </button>
            </div>
            {deleteAction.error && <p className="text-sm text-[color:var(--status-error)]">{deleteAction.error}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="cursor-pointer rounded-xl border border-[color:var(--status-error-border)] px-5 py-2 text-sm font-medium text-[color:var(--status-error)] transition-colors hover:bg-[color:var(--status-error-soft)] hover:text-[color:var(--status-error)]"
          >
            {security.deleteAccount}
          </button>
        )}
      </div>
    </div>
  );
};
