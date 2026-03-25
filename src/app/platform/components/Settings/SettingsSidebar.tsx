'use client';

import { clsx } from 'clsx';
import type { TSettingsSection } from '@interfaces';
import { useTranslations } from '@hooks';
import { SIDEBAR_GROUPS } from './consts';

export interface ISettingsSidebarProps {
  activeSection: TSettingsSection;
  onSectionChange: (section: TSettingsSection) => void;
}

export const SettingsSidebar = ({
  activeSection,
  onSectionChange,
}: ISettingsSidebarProps) => {
  const t = useTranslations();
  const { groups, sections } = t.platform.settings;

  return (
    <div className="w-52 shrink-0 overflow-y-auto border-r border-black/5 bg-black/[0.02] py-4">
      {SIDEBAR_GROUPS.map((group, index) => (
        <div
          key={group.labelKey}
          className={clsx('px-3 py-3', index > 0 && 'border-t border-black/5')}
        >
          <span className="mb-2 block px-3 text-xs font-medium tracking-wider text-black/30 uppercase">
            {groups[group.labelKey]}
          </span>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={clsx(
                  'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-all',
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-white shadow-sm'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
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
