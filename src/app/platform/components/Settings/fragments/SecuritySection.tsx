'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import type { IChangePasswordPayload } from '@interfaces';
import { MIN_PASSWORD_LENGTH } from '@constants';
import { useAsyncAction, useTranslations } from '@hooks';

import { IncorrectCurrentPasswordError } from '../hooks';
import { SettingsInput } from '../SettingsInput';
import { SettingsPrimaryButton } from '../SettingsPrimaryButton';

export interface ISecuritySectionProps {
  onChangePassword: (payload: IChangePasswordPayload) => Promise<void>;
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

    passwordAction.run(async () => {
      try {
        await onChangePassword({ currentPassword, newPassword });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        if (error instanceof IncorrectCurrentPasswordError) {
          throw new Error(security.currentPasswordIncorrect);
        }

        throw error;
      }
    }, security.updateFailed);
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
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {security.changePassword}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {security.passwordCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {security.passwordBlurb}
        </p>

        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-overlay)] text-[color:var(--accent)] shadow-[inset_0_0_0_1px_var(--border-strong)]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[16px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
                {security.passwordCardTitle}
              </p>
              <p className="mt-1 text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase">
                {security.passwordCardCaption}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor={currentPasswordId}
                className="mb-1 block text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase"
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
                  className="mb-1 block text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase"
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
                  className="mb-1 block text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--text-subtle)] uppercase"
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
                <span className="text-[color:var(--accent-strong)]">{security.passwordUpdated}</span>
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
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--status-error)] uppercase">
            {security.dangerZone}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--status-error)] uppercase">
            {security.dangerZoneCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {security.dangerZoneBlurb}
        </p>

        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--status-error-border)] bg-[color:var(--status-error-bg)] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--status-error-soft)] text-[color:var(--status-error)] shadow-[inset_0_0_0_1px_var(--status-error-border)]">
              <ShieldAlert className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[16px] leading-none tracking-tight text-[color:var(--text-strong)] italic">
                {security.deleteAccount}
              </p>
              <p className="mt-1 text-[10.5px] font-medium tracking-[0.16em] text-[color:var(--status-error)]/80 uppercase">
                {security.deleteAccountCaption}
              </p>
            </div>
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="shrink-0 cursor-pointer rounded-xl border border-[color:var(--status-error-border)] bg-transparent px-4 py-2 text-[12px] font-medium tracking-tight text-[color:var(--status-error)] transition-colors hover:bg-[color:var(--status-error-soft)]"
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
                  className="cursor-pointer rounded-xl bg-[color:var(--status-error)] px-5 py-2 text-[13px] font-medium text-[color:var(--on-accent)] shadow-[0_8px_22px_-12px_var(--status-error-soft)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteAction.loading ? security.deleting : security.deleteButton}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="cursor-pointer rounded-xl bg-[color:var(--surface-overlay)] px-5 py-2 text-[13px] font-medium text-[color:var(--text)] transition-colors hover:bg-[color:var(--border)]"
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
