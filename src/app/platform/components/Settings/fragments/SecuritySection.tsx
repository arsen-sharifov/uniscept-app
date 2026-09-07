'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import type { IChangePasswordPayload, TChangePasswordResult } from '@interfaces';
import { MIN_PASSWORD_LENGTH } from '@constants';
import { useAsyncAction } from '@hooks';
import { useTranslations } from '@/i18n';

import { SettingsInput } from '../SettingsInput';
import { SettingsPrimaryButton } from '../SettingsPrimaryButton';

interface ISecuritySectionProps {
  onChangePassword: (payload: IChangePasswordPayload) => Promise<TChangePasswordResult>;
  onDeleteAccount: () => Promise<void>;
}

export const SecuritySection = ({ onChangePassword, onDeleteAccount }: ISecuritySectionProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { security } = t.platform.settings;
  const id = useId();
  const currentPasswordId = `${id}-current`;
  const newPasswordId = `${id}-new`;
  const confirmPasswordId = `${id}-confirm`;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordAction = useAsyncAction();
  const deleteAction = useAsyncAction();

  const handleChangePassword = () => {
    if (!currentPassword) {
      passwordAction.setError(security.currentPasswordRequired);

      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      passwordAction.setError(security.passwordTooShort);

      return;
    }

    if (newPassword !== confirmPassword) {
      passwordAction.setError(security.passwordMismatch);

      return;
    }

    if (newPassword === currentPassword) {
      passwordAction.setError(security.passwordSame);

      return;
    }

    let result: TChangePasswordResult | undefined;

    passwordAction.run(
      async () => {
        result = await onChangePassword({ currentPassword, newPassword });
        if (result === 'incorrectCurrentPassword') {
          throw new Error('Incorrect current password');
        }

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      },
      () => (result === 'incorrectCurrentPassword' ? security.currentPasswordIncorrect : security.updateFailed),
    );
  };

  const handleDelete = () => {
    deleteAction.run(async () => {
      await onDeleteAccount();
      router.push('/login');
    }, security.deleteFailed);
  };

  const canSubmit = Boolean(currentPassword && newPassword && confirmPassword);

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {security.changePassword}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {security.passwordCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {security.passwordBlurb}
        </p>

        <div className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-overlay)] text-[color:var(--accent-text)] ring-1 ring-[color:var(--border-strong)]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-grotesk text-[16px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
                {security.passwordCardTitle}
              </p>
              <p className="mt-1 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
                {security.passwordCardCaption}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor={currentPasswordId}
                className="mb-1 block font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase"
              >
                {security.currentPassword}
              </label>
              <SettingsInput
                id={currentPasswordId}
                type="password"
                autoComplete="current-password"
                placeholder={security.currentPassword}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={newPasswordId}
                  className="mb-1 block font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase"
                >
                  {security.newPassword}
                </label>
                <SettingsInput
                  id={newPasswordId}
                  type="password"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder={security.newPassword}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor={confirmPasswordId}
                  className="mb-1 block font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase"
                >
                  {security.confirmPassword}
                </label>
                <SettingsInput
                  id={confirmPasswordId}
                  type="password"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  placeholder={security.confirmPassword}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <div className="min-w-0 flex-1 truncate text-[11.5px] leading-snug">
              {passwordAction.success && (
                <span className="text-[color:var(--status-success)]">{security.passwordUpdated}</span>
              )}
              {passwordAction.error && <span className="text-[color:var(--status-error)]">{passwordAction.error}</span>}
            </div>
            <SettingsPrimaryButton onClick={handleChangePassword} disabled={passwordAction.loading || !canSubmit}>
              {passwordAction.loading ? security.updatingPassword : security.updatePassword}
            </SettingsPrimaryButton>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--status-error)] uppercase">
            {security.dangerZone}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--status-error)] uppercase">
            {security.dangerZoneCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {security.dangerZoneBlurb}
        </p>

        <div className="relative overflow-hidden rounded-xl border border-[color:var(--status-error-border)] bg-[color:var(--status-error-bg)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--status-error-soft)] text-[color:var(--status-error)] ring-1 ring-[color:var(--status-error-border)]">
              <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-grotesk text-[16px] leading-none font-semibold tracking-tight text-[color:var(--text-strong)]">
                {security.deleteAccount}
              </p>
              <p className="mt-1 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--status-error)]/80 uppercase">
                {security.deleteAccountCaption}
              </p>
            </div>
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 cursor-pointer rounded-lg border border-[color:var(--status-error-border)] bg-transparent px-4 py-2 text-[12px] font-medium tracking-tight text-[color:var(--status-error)] transition-colors duration-200 ease-out hover:bg-[color:var(--status-error-soft)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
              >
                {security.deleteAccount}
              </button>
            )}
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 space-y-3">
              <p className="text-[12.5px] leading-relaxed text-[color:var(--status-error)]">{security.deleteConfirm}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteAction.loading}
                  className="cursor-pointer rounded-lg bg-[color:var(--status-error)] px-5 py-2 text-[13px] font-medium text-[color:var(--on-status)] shadow-[0_10px_28px_-12px_var(--status-error-soft)] transition-[opacity,transform,box-shadow] duration-200 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:bg-[color:var(--surface-overlay)] disabled:text-[color:var(--text-subtle)] disabled:shadow-none disabled:active:translate-y-0 motion-reduce:transition-none"
                >
                  {deleteAction.loading ? security.deleting : security.deleteButton}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cursor-pointer rounded-lg border border-[color:var(--border-strong)] px-5 py-2 text-[13px] font-medium text-[color:var(--text)] transition-colors duration-200 ease-out hover:bg-[color:var(--surface-overlay)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px motion-reduce:transition-none"
                >
                  {security.cancel}
                </button>
                {deleteAction.error && (
                  <span className="text-[12px] text-[color:var(--status-error)]">{deleteAction.error}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
