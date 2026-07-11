'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import type { IWorkspaceRole, IWorkspaceRolePermissions } from '@interfaces';
import { MAX_NAME_LENGTH } from '@constants';
import { useTranslations } from '@/i18n';

import { SettingsInput, SettingsPrimaryButton, Toggle } from '../../Settings';
import { DEFAULT_ROLE_ICON_KEY, EMPTY_PERMISSIONS, PERMISSION_DEFINITIONS, ROLE_ICONS } from '../consts';

export interface IRoleEditorProps {
  role: IWorkspaceRole | null;
  onSave: (name: string, icon: string, permissions: IWorkspaceRolePermissions) => Promise<boolean>;
  onCancel: () => void;
}

export const RoleEditor = ({ role, onSave, onCancel }: IRoleEditorProps) => {
  const t = useTranslations();
  const { roles: copy, permissions } = t.platform.workspaceSettings;

  const [name, setName] = useState(role?.name ?? '');
  const [icon, setIcon] = useState(role?.icon ?? DEFAULT_ROLE_ICON_KEY);
  const [perms, setPerms] = useState<IWorkspaceRolePermissions>(
    role
      ? {
          canEditCanvas: role.canEditCanvas,
          canComment: role.canComment,
          canManageStructure: role.canManageStructure,
          canManageMembers: role.canManageMembers,
          canManageRoles: role.canManageRoles,
          canManageWorkspace: role.canManageWorkspace,
        }
      : EMPTY_PERMISSIONS,
  );
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !saving;
  const submitLabel = role ? copy.save : copy.create;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    const ok = await onSave(trimmedName, icon, perms);
    setSaving(false);
    if (ok) onCancel();
  };

  return (
    <div className="space-y-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5">
      <div>
        <header className="mb-1.5 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {copy.nameLabel}
          </h3>
          <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--text-faint)] uppercase">
            {trimmedName.length}/{MAX_NAME_LENGTH}
          </span>
        </header>
        <SettingsInput
          autoFocus
          type="text"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder={copy.namePlaceholder}
          onChange={(inputEvent) => setName(inputEvent.target.value)}
        />
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
          {copy.iconLabel}
        </h3>
        <div role="radiogroup" aria-label={copy.iconLabel} className="grid grid-cols-6 gap-2">
          {ROLE_ICONS.map((option) => (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={icon === option.key}
              aria-label={option.key}
              onClick={() => setIcon(option.key)}
              className={clsx(
                'flex aspect-square cursor-pointer items-center justify-center rounded-lg border transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none',
                icon === option.key
                  ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                  : 'border-[color:var(--border)] text-[color:var(--text-subtle)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]',
              )}
            >
              <option.icon className="h-4 w-4" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
          {copy.permissionsLabel}
        </h3>
        <div className="space-y-3">
          {PERMISSION_DEFINITIONS.map((definition) => (
            <Toggle
              key={definition.key}
              icon={definition.icon}
              label={permissions[definition.key].name}
              description={permissions[definition.key].description}
              checked={perms[definition.key]}
              onChange={(value) => setPerms((prev) => ({ ...prev, [definition.key]: value }))}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
        >
          {copy.cancel}
        </button>
        <SettingsPrimaryButton onClick={handleSave} disabled={!canSave}>
          {saving ? copy.saving : submitLabel}
        </SettingsPrimaryButton>
      </div>
    </div>
  );
};
