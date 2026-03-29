'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAsyncAction, useTranslations } from '@hooks';
import { Avatar } from '@/components';

export interface IProfileSectionProps {
  user: User | null;
  onUpdateProfile: (name: string) => Promise<void>;
  onUpdateEmail: (email: string) => Promise<void>;
}

export const ProfileSection = ({
  user,
  onUpdateProfile,
  onUpdateEmail,
}: IProfileSectionProps) => {
  const t = useTranslations();
  const { profile } = t.platform.settings;

  const [name, setName] = useState(user?.user_metadata?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const save = useAsyncAction();
  const emailChange = useAsyncAction();

  const nameChanged = name !== (user?.user_metadata?.name ?? '');
  const emailChanged = email !== (user?.email ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar name={name} />
        <div className="min-w-0">
          <p className="font-medium text-black">{name}</p>
          <p className="truncate text-sm text-black/40">{email}</p>
        </div>
      </div>

      <div className="max-w-sm space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black/60">
            {profile.name}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black transition-colors focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              save.run(() => onUpdateProfile(name), profile.saveFailed)
            }
            disabled={save.loading || !nameChanged || !name.trim()}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {save.loading ? profile.saving : profile.save}
          </button>
          {save.success && (
            <span className="text-sm text-emerald-600">{profile.saved}</span>
          )}
          {save.error && (
            <span className="text-sm text-red-500">{save.error}</span>
          )}
        </div>

        <div className="border-t border-black/5 pt-6">
          <label className="mb-1 block text-sm font-medium text-black/60">
            {profile.email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black transition-colors focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              emailChange.run(
                () => onUpdateEmail(email),
                profile.emailChangeFailed
              )
            }
            disabled={emailChange.loading || !emailChanged || !email.trim()}
            className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {emailChange.loading ? profile.changingEmail : profile.changeEmail}
          </button>
          {emailChange.success && (
            <span className="text-sm text-emerald-600">
              {profile.emailChangeRequested}
            </span>
          )}
          {emailChange.error && (
            <span className="text-sm text-red-500">{emailChange.error}</span>
          )}
        </div>
      </div>
    </div>
  );
};
