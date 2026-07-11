'use client';

import { Mail, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { IWorkspaceInvitation, IWorkspaceMember, IWorkspaceRole } from '@interfaces';
import { EMAIL_PATTERN } from '@constants';
import { useTranslations } from '@/i18n';
import { roleLabel } from '@/lib/utils';

import { MemberRow } from './MemberRow';
import { OwnershipTransferDialog } from './OwnershipTransferDialog';
import { RoleSelect } from './RoleSelect';
import { SettingsInput, SettingsPrimaryButton } from '../../Settings';

export interface IMembersSectionProps {
  members: IWorkspaceMember[];
  roles: IWorkspaceRole[];
  invitations: IWorkspaceInvitation[];
  currentUserId: string | null;
  canManageMembers: boolean;
  onAssignRole: (userId: string, roleId: string) => void;
  onRemoveMember: (userId: string) => void;
  onTransferOwnership: (userId: string) => void;
  onInvite: (email: string, roleId: string) => Promise<boolean>;
  onRevokeInvitation: (invitationId: string) => void;
}

export const MembersSection = ({
  members,
  roles,
  invitations,
  currentUserId,
  canManageMembers,
  onAssignRole,
  onRemoveMember,
  onTransferOwnership,
  onInvite,
  onRevokeInvitation,
}: IMembersSectionProps) => {
  const t = useTranslations();
  const copy = t.platform.workspaceSettings.members;

  const assignableRoles = useMemo(() => roles.filter((role) => !role.isOwner), [roles]);
  const ownerRole = useMemo(() => roles.find((role) => role.isOwner) ?? null, [roles]);
  const currentIsOwner = useMemo(
    () => members.find((member) => member.userId === currentUserId)?.isOwner ?? false,
    [members, currentUserId],
  );
  const defaultRoleId = useMemo(
    () => (assignableRoles.find((role) => role.key === 'member') ?? assignableRoles[0])?.id ?? '',
    [assignableRoles],
  );

  const [transferTarget, setTransferTarget] = useState<IWorkspaceMember | null>(null);
  const [email, setEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [sending, setSending] = useState(false);

  const effectiveInviteRoleId = assignableRoles.some((role) => role.id === inviteRoleId) ? inviteRoleId : defaultRoleId;
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const canInvite = emailValid && effectiveInviteRoleId.length > 0 && !sending;

  const handleInvite = async () => {
    if (!canInvite) return;

    setSending(true);
    const ok = await onInvite(email.trim(), effectiveInviteRoleId);
    setSending(false);
    if (ok) setEmail('');
  };

  return (
    <div className="space-y-6">
      <section>
        <header className="mb-2 flex items-baseline justify-between">
          <p className="text-[12px] text-[color:var(--text-muted)]">{copy.hint}</p>
          <span className="text-[10.5px] tracking-[0.14em] text-[color:var(--text-faint)] uppercase">
            {members.length}
          </span>
        </header>
        <div className="divide-y divide-[color:var(--border)]">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              roles={currentIsOwner ? roles : assignableRoles}
              ownerRoleId={ownerRole?.id ?? null}
              isSelf={member.userId === currentUserId}
              canManage={canManageMembers}
              onAssignRole={onAssignRole}
              onRemove={onRemoveMember}
              onRequestTransfer={setTransferTarget}
            />
          ))}
        </div>
      </section>

      {canManageMembers && (
        <section className="border-t border-[color:var(--border)] pt-4">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {copy.inviteTitle}
          </h3>
          <p className="mt-1 mb-2 text-[12px] text-[color:var(--text-muted)]">{copy.inviteHint}</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[12rem] flex-1">
              <SettingsInput
                type="email"
                value={email}
                placeholder={copy.emailPlaceholder}
                onChange={(inputEvent) => setEmail(inputEvent.target.value)}
              />
            </div>
            <RoleSelect
              className="w-40"
              value={effectiveInviteRoleId}
              roles={assignableRoles}
              onChange={setInviteRoleId}
              ariaLabel={t.platform.workspaceSettings.general.roleStat}
            />
            <SettingsPrimaryButton onClick={handleInvite} disabled={!canInvite}>
              {sending ? copy.sending : copy.sendInvite}
            </SettingsPrimaryButton>
          </div>

          {invitations.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                {copy.pendingTitle}
              </h4>
              <div className="divide-y divide-[color:var(--border)]">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface-overlay)] text-[color:var(--text-subtle)]">
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[color:var(--text-strong)]">{invitation.email}</p>
                      <p className="truncate text-[12px] text-[color:var(--text-muted)]">
                        {roleLabel(invitation.roleKey, invitation.roleName, t)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRevokeInvitation(invitation.id)}
                      className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--status-error-soft)] hover:text-[color:var(--status-error)]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      {copy.revoke}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {transferTarget && (
        <OwnershipTransferDialog
          member={transferTarget}
          onConfirm={() => {
            onTransferOwnership(transferTarget.userId);
            setTransferTarget(null);
          }}
          onCancel={() => setTransferTarget(null)}
        />
      )}
    </div>
  );
};
