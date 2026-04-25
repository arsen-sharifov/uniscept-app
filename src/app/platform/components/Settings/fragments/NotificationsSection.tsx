'use client';

import { Bell, MessageSquare, Mail, Users } from 'lucide-react';
import type { IPreferences, TPreferenceUpdater } from '@interfaces';
import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';
import { Toggle } from '../Toggle';

export interface INotificationsSectionProps {
  preferences: IPreferences;
  onUpdate: TPreferenceUpdater;
}

export const NotificationsSection = ({
  preferences,
  onUpdate,
}: INotificationsSectionProps) => {
  const t = useTranslations();
  const { notifications, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <p className="text-sm text-black/40">{notifications.description}</p>
        <Tooltip text={comingSoon} />
      </div>

      <div className="space-y-4">
        <Toggle
          icon={MessageSquare}
          label={notifications.mentions}
          description={notifications.mentionsDescription}
          checked={preferences.emailMentions}
          onChange={(v) => onUpdate('emailMentions', v)}
          disabled
        />
        <Toggle
          icon={Mail}
          label={notifications.comments}
          description={notifications.commentsDescription}
          checked={preferences.emailComments}
          onChange={(v) => onUpdate('emailComments', v)}
          disabled
        />
        <Toggle
          icon={Users}
          label={notifications.invites}
          description={notifications.invitesDescription}
          checked={preferences.emailInvites}
          onChange={(v) => onUpdate('emailInvites', v)}
          disabled
        />
        <Toggle
          icon={Bell}
          label={notifications.digest}
          description={notifications.digestDescription}
          checked={preferences.emailDigest}
          onChange={(v) => onUpdate('emailDigest', v)}
          disabled
        />
      </div>
    </div>
  );
};
