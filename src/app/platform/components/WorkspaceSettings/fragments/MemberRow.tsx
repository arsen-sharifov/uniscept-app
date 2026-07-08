'use client';

import { Crown, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { IWorkspaceMember, IWorkspaceRole } from '@interfaces';

import { Avatar } from '@/components';
import { useTranslations } from '@/i18n';
import { roleLabel } from '@/lib/utils';

import { RoleSelect } from './RoleSelect';

interface IMemberRowProps {
  member: IWorkspaceMember;
  roles: IWorkspaceRole[];
  ownerRoleId: string | null;
  isSelf: boolean;
  canManage: boolean;
  onAssignRole: (userId: string, roleId: string) => void;
  onRemove: (userId: string) => void;
  onRequestTransfer: (member: IWorkspaceMember) => void;
}

export const MemberRow = ({
  member,
  roles,
  ownerRoleId,
  isSelf,
  canManage,
  onAssignRole,
  onRemove,
  onRequestTransfer,
}: IMemberRowProps) => {
  const t = useTranslations();
  const { members } = t.platform.workspaceSettings;
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const displayName = member.name || member.email;

  const handleRoleChange = (roleId: string) => {
    if (roleId === ownerRoleId) {
      onRequestTransfer(member);
    } else {
      onAssignRole(member.userId, roleId);
    }
  };

  const renderControl = () => {
    if (member.isOwner) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--accent-soft)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--accent-text)]">
          <Crown className="h-3.5 w-3.5" aria-hidden />
          {t.platform.workspaceSettings.roleNames.owner}
        </span>
      );
    }

    if (!canManage) {
      return (
        <span className="px-2.5 py-1 text-[12px] font-medium text-[color:var(--text-muted)]">
          {roleLabel(member.roleKey, member.roleName, t)}
        </span>
      );
    }

    if (confirmingRemove) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[color:var(--text-muted)]">{members.remove}?</span>
          <button
            type="button"
            onClick={() => setConfirmingRemove(false)}
            className="cursor-pointer rounded-lg px-2 py-1 text-[12px] font-medium text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            {members.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmingRemove(false);
              onRemove(member.userId);
            }}
            className="cursor-pointer rounded-lg bg-[color:var(--status-error)] px-2.5 py-1 text-[12px] font-medium text-white transition-colors hover:bg-[color:var(--status-error-border)]"
          >
            {members.removeConfirm}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5">
        <RoleSelect
          className="w-32"
          value={member.roleId}
          roles={roles}
          onChange={handleRoleChange}
          ariaLabel={members.changeRole}
        />
        {!isSelf && (
          <button
            type="button"
            onClick={() => setConfirmingRemove(true)}
            title={members.remove}
            aria-label={members.remove}
            className="cursor-pointer rounded-lg p-1.5 text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--status-error-soft)] hover:text-[color:var(--status-error)]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar name={displayName} icon={member.avatarIcon} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--text-strong)]">
          <span className="truncate">{displayName}</span>
          {isSelf && (
            <span className="shrink-0 rounded-md bg-[color:var(--surface-overlay)] px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[color:var(--text-muted)] uppercase">
              {members.you}
            </span>
          )}
        </p>
        <p className="truncate text-[12px] text-[color:var(--text-muted)]">{member.email}</p>
      </div>
      <div className="shrink-0">{renderControl()}</div>
    </div>
  );
};
