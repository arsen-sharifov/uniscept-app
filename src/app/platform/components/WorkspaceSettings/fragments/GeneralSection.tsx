'use client';

import { CalendarDays, LayoutGrid, LogOut, Shield, Users } from 'lucide-react';
import { type KeyboardEvent, useId, useState } from 'react';

import { MAX_NAME_LENGTH } from '@constants';
import { useFormatter, useTranslations } from '@/i18n';

import { DetailRow } from './DetailRow';
import { SettingsInput, SettingsPrimaryButton } from '../../Settings';

interface IGeneralSectionProps {
  workspaceId: string;
  initialName: string;
  createdAt: string | null;
  memberCount: number;
  currentRoleName: string | null;
  isOwner: boolean;
  canManageWorkspace: boolean;
  onRename: (id: string, name: string) => Promise<void> | void;
  onLeave: (id: string) => Promise<void> | void;
}

export const GeneralSection = ({
  workspaceId,
  initialName,
  createdAt,
  memberCount,
  currentRoleName,
  isOwner,
  canManageWorkspace,
  onRename,
  onLeave,
}: IGeneralSectionProps) => {
  const t = useTranslations();
  const format = useFormatter();
  const leaveHintId = useId();

  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isLeaveLocked = isOwner || leaving;
  const trimmedName = name.trim();
  const changed = trimmedName !== initialName;
  const canSave = changed && trimmedName.length > 0 && !saving;

  const createdLabel = createdAt
    ? format.dateTime(new Date(createdAt), { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    await onRename(workspaceId, trimmedName);
    setSaving(false);
  };

  const handleKeyDown = (keyEvent: KeyboardEvent<HTMLInputElement>) => {
    if (keyEvent.key === 'Enter') handleSave();
  };

  const handleLeave = async () => {
    setLeaving(true);
    await onLeave(workspaceId);
    setLeaving(false);
  };

  return (
    <div className="space-y-6">
      {canManageWorkspace && (
        <section>
          <header className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
              {t.platform.workspaceSettings.general.nameLabel}
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
                aria-label={t.platform.workspaceSettings.general.nameLabel}
                placeholder={t.platform.workspaceSettings.general.namePlaceholder}
                onChange={(inputEvent) => setName(inputEvent.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <SettingsPrimaryButton onClick={handleSave} disabled={!canSave}>
              {saving ? t.platform.workspaceSettings.general.saving : t.platform.workspaceSettings.general.save}
            </SettingsPrimaryButton>
          </div>
        </section>
      )}

      <section className="divide-y divide-[color:var(--border)] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5">
        {!canManageWorkspace && (
          <DetailRow icon={LayoutGrid} label={t.platform.workspaceSettings.general.nameLabel} value={initialName} />
        )}
        <DetailRow
          icon={Users}
          label={t.platform.workspaceSettings.general.membersStat}
          value={String(memberCount)}
          mono
        />
        {currentRoleName && (
          <DetailRow icon={Shield} label={t.platform.workspaceSettings.general.roleStat} value={currentRoleName} />
        )}
        {createdLabel && (
          <DetailRow
            icon={CalendarDays}
            label={t.platform.workspaceSettings.general.createdStat}
            value={createdLabel}
            mono
          />
        )}
      </section>

      <section className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[color:var(--border)] pt-5">
        <div className="min-w-0 flex-1 basis-64">
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {t.platform.workspaceSettings.general.leaveTitle}
          </h3>
          <p id={leaveHintId} className="mt-1 font-grotesk text-xs leading-snug text-[color:var(--text-muted)]">
            {isOwner
              ? t.platform.workspaceSettings.general.leaveOwnerHint
              : t.platform.workspaceSettings.general.leaveHint}
          </p>
        </div>
        <button
          type="button"
          onClick={isLeaveLocked ? undefined : handleLeave}
          aria-disabled={isLeaveLocked}
          aria-describedby={leaveHintId}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-[color:var(--status-error-border)] bg-transparent px-4 py-2 font-grotesk text-[12px] font-medium tracking-tight text-[color:var(--status-error)] transition-colors duration-200 ease-out hover:bg-[color:var(--status-error-soft)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:translate-y-px aria-disabled:cursor-not-allowed aria-disabled:border-[color:var(--border)] aria-disabled:text-[color:var(--text-subtle)] aria-disabled:hover:bg-transparent aria-disabled:active:translate-y-0 motion-reduce:transition-none"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          {leaving ? t.platform.workspaceSettings.general.leaving : t.platform.workspaceSettings.general.leave}
        </button>
      </section>
    </div>
  );
};
