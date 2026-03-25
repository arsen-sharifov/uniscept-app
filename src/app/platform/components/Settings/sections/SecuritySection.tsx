'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAsyncAction, useTranslations } from '@hooks';

export interface ISecuritySectionProps {
  onChangePassword: (password: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export const SecuritySection = ({
  onChangePassword,
  onDeleteAccount,
}: ISecuritySectionProps) => {
  const router = useRouter();
  const t = useTranslations();
  const { security } = t.platform.settings;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const passwordAction = useAsyncAction();
  const deleteAction = useAsyncAction();

  const handleChangePassword = () => {
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
        <h3 className="mb-3 text-xs font-medium tracking-wider text-black/30 uppercase">
          {security.changePassword}
        </h3>
        <div className="max-w-sm space-y-3">
          <input
            type="password"
            placeholder={security.newPassword}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black transition-colors focus:border-emerald-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder={security.confirmPassword}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black transition-colors focus:border-emerald-500 focus:outline-none"
          />
          {passwordAction.error && (
            <p className="text-sm text-red-500">{passwordAction.error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleChangePassword}
              disabled={
                passwordAction.loading || !newPassword || !confirmPassword
              }
              className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordAction.loading
                ? security.updatingPassword
                : security.updatePassword}
            </button>
            {passwordAction.success && (
              <span className="text-sm text-emerald-600">
                {security.passwordUpdated}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-black/5 pt-6">
        <h3 className="mb-3 text-xs font-medium tracking-wider text-red-500/70 uppercase">
          {security.dangerZone}
        </h3>
        {showDeleteConfirm ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{security.deleteConfirm}</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteAction.loading}
                className="cursor-pointer rounded-xl bg-red-500 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteAction.loading
                  ? security.deleting
                  : security.deleteButton}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cursor-pointer rounded-xl bg-black/5 px-5 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-black/10"
              >
                {security.cancel}
              </button>
            </div>
            {deleteAction.error && (
              <p className="text-sm text-red-500">{deleteAction.error}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="cursor-pointer rounded-xl border border-red-200 px-5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            {security.deleteAccount}
          </button>
        )}
      </div>
    </div>
  );
};
