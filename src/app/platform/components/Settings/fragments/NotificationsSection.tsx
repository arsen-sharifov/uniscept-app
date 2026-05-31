'use client';

import { useTranslations } from '@hooks';

import { NOTIFICATION_ITEMS } from '../consts';
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
          {NOTIFICATION_ITEMS.map(({ icon, labelKey, descriptionKey }) => (
            <div key={labelKey} className="py-4">
              <Toggle
                icon={icon}
                label={notifications[labelKey]}
                description={notifications[descriptionKey]}
                checked
                onChange={() => {}}
                disabled
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
