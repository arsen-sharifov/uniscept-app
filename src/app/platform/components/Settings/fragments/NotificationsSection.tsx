'use client';

import { AtSign, Mail, MessageSquare, UserPlus } from 'lucide-react';

import { useTranslations } from '@hooks';

import { Toggle } from '../Toggle';

export const NotificationsSection = () => {
  const t = useTranslations();
  const { notifications, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-4 flex items-center gap-2.5">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {notifications.title}
          </h3>
          <span className="rounded-full bg-[color:var(--surface-overlay)] px-2 py-0.5 text-[9.5px] font-semibold tracking-[0.16em] text-[color:var(--text-subtle)] uppercase shadow-[inset_0_0_0_1px_var(--border)]">
            {comingSoon}
          </span>
        </header>

        <div className="divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5">
          <div className="py-4">
            <Toggle
              icon={AtSign}
              label={notifications.mentions}
              description={notifications.mentionsDescription}
              checked
              onChange={() => {}}
              disabled
            />
          </div>
          <div className="py-4">
            <Toggle
              icon={MessageSquare}
              label={notifications.comments}
              description={notifications.commentsDescription}
              checked
              onChange={() => {}}
              disabled
            />
          </div>
          <div className="py-4">
            <Toggle
              icon={UserPlus}
              label={notifications.invites}
              description={notifications.invitesDescription}
              checked
              onChange={() => {}}
              disabled
            />
          </div>
          <div className="py-4">
            <Toggle
              icon={Mail}
              label={notifications.digest}
              description={notifications.digestDescription}
              checked
              onChange={() => {}}
              disabled
            />
          </div>
        </div>
      </section>
    </div>
  );
};
