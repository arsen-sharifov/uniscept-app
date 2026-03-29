'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';
import { THEMES } from '../consts';

export const AppearanceSection = () => {
  const t = useTranslations();
  const { appearance, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-xs font-medium tracking-wider text-black/30 uppercase">
            {appearance.theme}
          </h3>
          <Tooltip text={comingSoon} />
        </div>
        <div className="flex gap-3 opacity-50">
          {THEMES.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              disabled
              className="flex flex-1 cursor-not-allowed flex-col items-center gap-2 rounded-xl border-2 border-black/5 px-4 py-4 text-black/40"
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {appearance[labelKey]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-black/5 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-xs font-medium tracking-wider text-black/30 uppercase">
            {appearance.language}
          </h3>
          <Tooltip text={comingSoon} />
        </div>
        <div className="relative inline-flex items-center">
          <Globe className="pointer-events-none absolute left-4 h-4 w-4 text-black/30" />
          <select
            disabled
            className="appearance-none rounded-xl border border-black/10 bg-black/[0.02] py-2 pr-10 pl-10 text-sm text-black/40"
          >
            <option>{appearance.english}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 h-3.5 w-3.5 text-black/30" />
        </div>
      </div>
    </div>
  );
};
