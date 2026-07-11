'use client';

import { CalendarDays, LayoutGrid, Shield, Users } from 'lucide-react';
import { useFormatter } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';

import { MAX_NAME_LENGTH } from '@constants';
import { useTranslations } from '@/i18n';

import { SettingsInput, SettingsPrimaryButton } from '../../Settings';

export interface IGeneralSectionProps {
  workspaceId: string;
  initialName: string;
  createdAt: string | null;
  memberCount: number;
  currentRoleName: string | null;
  canManageWorkspace: boolean;
  onRename: (id: string, name: string) => Promise<void> | void;
}

export const GeneralSection = ({
  workspaceId,
  initialName,
  createdAt,
  memberCount,
  currentRoleName,
  canManageWorkspace,
  onRename,
}: IGeneralSectionProps) => {
  const t = useTranslations();
  const format = useFormatter();
  const { general } = t.platform.workspaceSettings;

  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const changed = trimmedName !== initialName;
  const canSave = changed && trimmedName.length > 0 && !saving;

  const createdLabel = createdAt
    ? format.dateTime(new Date(createdAt), { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const details = [
    ...(canManageWorkspace ? [] : [{ icon: LayoutGrid, label: general.nameLabel, value: initialName }]),
    { icon: Users, label: general.membersStat, value: String(memberCount) },
    ...(currentRoleName ? [{ icon: Shield, label: general.roleStat, value: currentRoleName }] : []),
    ...(createdLabel ? [{ icon: CalendarDays, label: general.createdStat, value: createdLabel }] : []),
  ];

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    await onRename(workspaceId, trimmedName);
    setSaving(false);
  };

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyEvent.key === 'Enter') handleSave();
  };

  return (
    <div className="space-y-6">
      {canManageWorkspace && (
        <section>
          <header className="mb-2 flex items-baseline justify-between">
            <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
              {general.nameLabel}
            </h3>
            <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--text-faint)] uppercase">
              {trimmedName.length}/{MAX_NAME_LENGTH}
            </span>
          </header>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <SettingsInput
                type="text"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                aria-label={general.nameLabel}
                placeholder={general.namePlaceholder}
                onChange={(inputEvent) => setName(inputEvent.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <SettingsPrimaryButton onClick={handleSave} disabled={!canSave}>
              {saving ? general.saving : general.save}
            </SettingsPrimaryButton>
          </div>
        </section>
      )}

      <section className="divide-y divide-[color:var(--border)] rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--surface-overlay)] text-[color:var(--text-subtle)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-[13px] text-[color:var(--text-muted)]">{label}</span>
            <span className="ml-auto truncate pl-3 text-[13px] font-medium text-[color:var(--text-strong)]">
              {value}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};
