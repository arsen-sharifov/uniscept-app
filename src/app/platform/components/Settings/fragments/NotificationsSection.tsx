'use client';

import { Bell, MessageSquare, Mail, Users } from 'lucide-react';
import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';
import { Toggle } from '../Toggle';

export const NotificationsSection = () => {
  const t = useTranslations();
  const { notifications, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <p className="text-sm text-[color:var(--text-muted)]">{notifications.description}</p>
        <Tooltip text={comingSoon} />
      </div>

      <div className="space-y-4">
        <Toggle
          icon={MessageSquare}
          label={notifications.mentions}
          description={notifications.mentionsDescription}
          checked={true}
          onChange={() => {}}
          disabled
        />
        <Toggle
          icon={Mail}
          label={notifications.comments}
          description={notifications.commentsDescription}
          checked={true}
          onChange={() => {}}
          disabled
        />
        <Toggle
          icon={Users}
          label={notifications.invites}
          description={notifications.invitesDescription}
          checked={true}
          onChange={() => {}}
          disabled
        />
        <Toggle
          icon={Bell}
          label={notifications.digest}
          description={notifications.digestDescription}
          checked={true}
          onChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
};
