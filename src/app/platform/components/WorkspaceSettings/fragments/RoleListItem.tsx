'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import type { IWorkspaceRole } from '@interfaces';

import { Tooltip } from '@/components';
import { useTranslations } from '@/i18n';
import { roleLabel } from '@/lib/utils';

import { PERMISSION_DEFINITIONS } from '../consts';
import { RoleIcon } from './RoleIcon';

export interface IRoleListItemProps {
  role: IWorkspaceRole;
  canManage: boolean;
  onEdit: (role: IWorkspaceRole) => void;
  onDelete: (roleId: string) => void;
}

export const RoleListItem = ({ role, canManage, onEdit, onDelete }: IRoleListItemProps) => {
  const t = useTranslations();
  const { roles: copy, permissions } = t.platform.workspaceSettings;
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const editable = canManage && !role.isSystem;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]">
          <RoleIcon role={role} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-[color:var(--text-strong)]">
              {roleLabel(role.key, role.name, t)}
            </h4>
            {role.isSystem && (
              <span className="shrink-0 rounded-md bg-[color:var(--surface-overlay)] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[color:var(--text-subtle)] uppercase">
                {copy.systemLocked}
              </span>
            )}
          </div>
          <p className="text-[12px] text-[color:var(--text-muted)]">
            {role.memberCount} {copy.membersSuffix}
          </p>
        </div>

        {editable &&
          (confirmingDelete ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
              >
                {copy.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  onDelete(role.id);
                }}
                className="cursor-pointer rounded-lg bg-[color:var(--status-error)] px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:opacity-90"
              >
                {copy.deleteConfirm}
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(role)}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-[12px] font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
              >
                {copy.edit}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="cursor-pointer rounded-lg px-2.5 py-1 text-[12px] font-medium text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--status-error-soft)] hover:text-[color:var(--status-error)]"
              >
                {copy.delete}
              </button>
            </div>
          ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PERMISSION_DEFINITIONS.map((definition) => (
          <Tooltip key={definition.key} text={permissions[definition.key].name}>
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-md',
                role[definition.key]
                  ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]'
                  : 'bg-[color:var(--surface-overlay)] text-[color:var(--text-faint)]',
              )}
            >
              <definition.icon className="h-3.5 w-3.5" aria-hidden />
            </span>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
