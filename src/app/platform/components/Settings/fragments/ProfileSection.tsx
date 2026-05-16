'use client';

import { useEffect, useId, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { EMAIL_PATTERN } from '@constants';
import { useAsyncAction, useTranslations } from '@hooks';
import { Avatar } from '@/components';
import { SettingsInput } from '../SettingsInput';
import { SettingsPrimaryButton } from '../SettingsPrimaryButton';

export interface IProfileSectionProps {
  user: User | null;
  onUpdateProfile: (name: string) => Promise<void>;
  onUpdateEmail: (email: string) => Promise<void>;
}

export const ProfileSection = ({ user, onUpdateProfile, onUpdateEmail }: IProfileSectionProps) => {
  const t = useTranslations();
  const { profile } = t.platform.settings;
  const id = useId();
  const nameId = `${id}-name`;
  const emailId = `${id}-email`;

  const userName = user?.user_metadata?.name ?? '';
  const userEmail = user?.email ?? '';

  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const save = useAsyncAction();
  const emailChange = useAsyncAction();

  useEffect(() => {
    setName(userName);
  }, [userName]);

  useEffect(() => {
    setEmail(userEmail);
  }, [userEmail]);

  const nameChanged = name !== userName;
  const emailChanged = email !== userEmail;
  const emailIsValid = EMAIL_PATTERN.test(email.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="font-medium text-[color:var(--text-strong)]">{name}</p>
          <p className="truncate text-sm text-[color:var(--text-muted)]">{email}</p>
        </div>
      </div>

      <div className="max-w-sm space-y-4">
        <div>
          <label htmlFor={nameId} className="mb-1 block text-sm font-medium text-[color:var(--text)]">
            {profile.name}
          </label>
          <SettingsInput id={nameId} type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <SettingsPrimaryButton
            onClick={() => save.run(() => onUpdateProfile(name), profile.saveFailed)}
            disabled={save.loading || !nameChanged || !name.trim()}
          >
            {save.loading ? profile.saving : profile.save}
          </SettingsPrimaryButton>
          {save.success && <span className="text-sm text-[color:var(--accent-strong)]">{profile.saved}</span>}
          {save.error && <span className="text-sm text-[color:var(--status-error)]">{save.error}</span>}
        </div>

        <div className="border-t border-[color:var(--border)] pt-6">
          <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-[color:var(--text)]">
            {profile.email}
          </label>
          <SettingsInput id={emailId} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <SettingsPrimaryButton
            onClick={() => emailChange.run(() => onUpdateEmail(email.trim()), profile.emailChangeFailed)}
            disabled={emailChange.loading || !emailChanged || !emailIsValid}
          >
            {emailChange.loading ? profile.changingEmail : profile.changeEmail}
          </SettingsPrimaryButton>
          {emailChange.success && (
            <span className="text-sm text-[color:var(--accent-strong)]">{profile.emailChangeRequested}</span>
          )}
          {emailChange.error && <span className="text-sm text-[color:var(--status-error)]">{emailChange.error}</span>}
          {!emailChange.error && emailChanged && !emailIsValid && (
            <span className="text-sm text-[color:var(--status-error)]">{profile.emailInvalid}</span>
          )}
        </div>
      </div>
    </div>
  );
};
