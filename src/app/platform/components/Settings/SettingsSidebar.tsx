'use client';

import { clsx } from 'clsx';
import type { TSettingsSection } from '@interfaces';
import { useTranslations } from '@hooks';
import { SIDEBAR_GROUPS } from './consts';

export interface ISettingsSidebarProps {
  activeSection: TSettingsSection;
  onSectionChange: (section: TSettingsSection) => void;
}

export const SettingsSidebar = ({ activeSection, onSectionChange }: ISettingsSidebarProps) => {
  const t = useTranslations();
  const { groups, sections } = t.platform.settings;

  return (
    <div className="w-52 shrink-0 overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--app-bg-tint)] py-4 transition-[background-color,border-color] duration-300 ease-out">
      {SIDEBAR_GROUPS.map((group, index) => (
        <div key={group.labelKey} className={clsx('px-3 py-3', index > 0 && 'border-t border-[color:var(--border)]')}>
          <span className="mb-2 block px-3 text-xs font-medium tracking-wider text-[color:var(--text-subtle)] uppercase">
            {groups[group.labelKey]}
          </span>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
                className={clsx(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-all',
                  'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none',
                  activeSection === item.id
                    ? 'settings-sidebar__item--active font-medium shadow-sm'
                    : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{sections[item.id]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
