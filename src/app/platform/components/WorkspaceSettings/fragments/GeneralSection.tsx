'use client';

import { clsx } from 'clsx';
import { CalendarDays, LayoutGrid, Shield, Users } from 'lucide-react';
import { useFormatter } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';

import { MAX_NAME_LENGTH } from '@constants';
import { useTranslations } from '@/i18n';

import { SettingsInput, SettingsPrimaryButton } from '../../Settings';

interface IGeneralSectionProps {
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
    ...(canManageWorkspace ? [] : [{ icon: LayoutGrid, label: general.nameLabel, value: initialName, mono: false }]),
    { icon: Users, label: general.membersStat, value: String(memberCount), mono: true },
    ...(currentRoleName ? [{ icon: Shield, label: general.roleStat, value: currentRoleName, mono: false }] : []),
    ...(createdLabel ? [{ icon: CalendarDays, label: general.createdStat, value: createdLabel, mono: true }] : []),
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
          <header className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
              {general.nameLabel}
            </h3>
            <span className="shrink-0 font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-faint)] uppercase tabular-nums">
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

      <section className="divide-y divide-[color:var(--border)] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5">
        {details.map(({ icon: Icon, label, value, mono }) => (
          <div key={label} className="flex items-center gap-3 py-3.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--surface-overlay)] text-[color:var(--text-subtle)]">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 truncate font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
              {label}
            </span>
            <span
              className={clsx(
                'ml-auto min-w-0 truncate pl-3 text-right',
                mono
                  ? 'font-mono-ui text-[11px] text-[color:var(--text)] tabular-nums'
                  : 'font-grotesk text-sm font-medium text-[color:var(--text-strong)]',
              )}
            >
              {value}
            </span>
          </div>
        ))}
      </section>
    </div>
  );
};
