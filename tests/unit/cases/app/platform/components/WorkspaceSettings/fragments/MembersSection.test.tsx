import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceRole } from '@interfaces';

import { TRANSLATIONS } from '@mocks/i18n';
import { OWNER_ROLE, MEMBER_MANAGER_ROLE, TIERED_ROLES, WORKSPACE_MEMBERS, PENDING_INVITATIONS } from '@mocks/roles';
import { MembersSection } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onAssignRole = vi.fn();
const onRemoveMember = vi.fn();
const onTransferOwnership = vi.fn();
const onInvite = vi.fn();
const onRevokeInvitation = vi.fn();

const renderSection = (currentUserId: string, currentRole: IWorkspaceRole) =>
  render(
    <MembersSection
      members={WORKSPACE_MEMBERS}
      roles={TIERED_ROLES}
      invitations={PENDING_INVITATIONS}
      currentUserId={currentUserId}
      currentRole={currentRole}
      canManageMembers
      onAssignRole={onAssignRole}
      onRemoveMember={onRemoveMember}
      onTransferOwnership={onTransferOwnership}
      onInvite={onInvite}
      onRevokeInvitation={onRevokeInvitation}
    />,
  );

const optionNames = () => screen.getAllByRole('option').map((option) => option.textContent);

const changeRoleLabel = (roleName: string) =>
  `${TRANSLATIONS.platform.workspaceSettings.members.changeRole}: ${roleName}`;

describe('MembersSection', () => {
  describe('GIVEN a member manager who cannot manage roles', () => {
    beforeEach(() => {
      renderSection('u-self', MEMBER_MANAGER_ROLE);
    });

    describe('WHEN the role picker of a member opens', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
      });

      test('THEN only roles inside the manager ceiling are offered', () => {
        expect(optionNames()).toEqual([
          'Manager',
          TRANSLATIONS.platform.workspaceSettings.roleNames.member,
          TRANSLATIONS.platform.workspaceSettings.roleNames.viewer,
        ]);
      });
    });

    describe('WHEN the member list renders', () => {
      test('THEN a member above the manager ceiling shows a read-only role without a remove action', () => {
        expect(screen.queryByRole('button', { name: changeRoleLabel('Admin') })).not.toBeInTheDocument();
        expect(screen.getAllByText('Admin')).toHaveLength(2);
        expect(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.remove }),
        ).toHaveLength(1);
      });

      test('THEN only the invitation inside the manager ceiling can be revoked', () => {
        expect(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.revoke }),
        ).toHaveLength(1);
      });
    });

    describe('WHEN the invite role picker opens', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: `${TRANSLATIONS.platform.workspaceSettings.general.roleStat}: ${TRANSLATIONS.platform.workspaceSettings.roleNames.member}`,
          }),
        );
      });

      test('THEN invitations offer only grantable roles', () => {
        expect(optionNames()).toEqual([
          'Manager',
          TRANSLATIONS.platform.workspaceSettings.roleNames.member,
          TRANSLATIONS.platform.workspaceSettings.roleNames.viewer,
        ]);
      });
    });

    describe('WHEN a member is moved to a grantable role', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
        fireEvent.click(screen.getByRole('option', { name: TRANSLATIONS.platform.workspaceSettings.roleNames.viewer }));
      });

      test('THEN the new role is assigned', () => {
        expect(onAssignRole).toHaveBeenCalledExactlyOnceWith('u-member', 'role-viewer');
      });
    });

    describe('WHEN the current role of a member is picked again', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
        fireEvent.click(screen.getByRole('option', { name: TRANSLATIONS.platform.workspaceSettings.roleNames.member }));
      });

      test('THEN nothing is assigned and the picker closes', () => {
        expect(onAssignRole).not.toHaveBeenCalled();
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN the workspace owner', () => {
    beforeEach(() => {
      renderSection('u-owner', OWNER_ROLE);
    });

    describe('WHEN the member list renders', () => {
      test('THEN every other member can be re-roled and removed', () => {
        expect(screen.getByRole('button', { name: changeRoleLabel('Admin') })).toBeInTheDocument();
        expect(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.remove }),
        ).toHaveLength(3);
        expect(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.revoke }),
        ).toHaveLength(2);
      });
    });

    describe('WHEN the role picker of a member opens', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
      });

      test('THEN every role is offered, the owner role included', () => {
        expect(optionNames()).toEqual([
          TRANSLATIONS.platform.workspaceSettings.roleNames.owner,
          'Admin',
          'Manager',
          TRANSLATIONS.platform.workspaceSettings.roleNames.member,
          TRANSLATIONS.platform.workspaceSettings.roleNames.viewer,
        ]);
      });
    });

    describe('WHEN the owner role is picked for a member and the transfer is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
        fireEvent.click(screen.getByRole('option', { name: TRANSLATIONS.platform.workspaceSettings.roleNames.owner }));
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', {
            name: TRANSLATIONS.platform.workspaceSettings.members.transferConfirm,
          }),
        );
      });

      test('THEN the ownership goes to that member instead of a role change', () => {
        expect(onTransferOwnership).toHaveBeenCalledExactlyOnceWith('u-member');
        expect(onAssignRole).not.toHaveBeenCalled();
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the transfer is cancelled', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getByRole('button', {
            name: changeRoleLabel(TRANSLATIONS.platform.workspaceSettings.roleNames.member),
          }),
        );
        fireEvent.click(screen.getByRole('option', { name: TRANSLATIONS.platform.workspaceSettings.roleNames.owner }));
        fireEvent.click(
          within(screen.getByRole('alertdialog')).getByRole('button', {
            name: TRANSLATIONS.platform.workspaceSettings.members.cancel,
          }),
        );
      });

      test('THEN the confirmation closes without a transfer', () => {
        expect(onTransferOwnership).not.toHaveBeenCalled();
        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      });
    });

    describe('WHEN the removal of a member is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.remove })[0]!,
        );
        fireEvent.click(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.removeConfirm })[0]!,
        );
      });

      test('THEN that member is removed', () => {
        expect(onRemoveMember).toHaveBeenCalledExactlyOnceWith('u-self');
      });
    });

    describe('WHEN a pending invitation is revoked', () => {
      beforeEach(() => {
        fireEvent.click(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.revoke })[0]!,
        );
      });

      test('THEN that invitation is revoked', () => {
        expect(onRevokeInvitation).toHaveBeenCalledExactlyOnceWith('inv-member');
      });
    });

    describe('WHEN a teammate is invited with the default role', () => {
      beforeEach(async () => {
        onInvite.mockResolvedValue(true);
        fireEvent.change(
          screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder),
          { target: { value: ' new@uniscept.dev ' } },
        );
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.sendInvite }),
          );
        });
      });

      test('THEN the trimmed email is invited as a member and the field clears', () => {
        expect(onInvite).toHaveBeenCalledExactlyOnceWith('new@uniscept.dev', 'role-member');
        expect(
          screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder),
        ).toHaveValue('');
      });
    });

    describe('WHEN an invalid email is typed', () => {
      beforeEach(() => {
        fireEvent.change(
          screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder),
          { target: { value: 'not-an-email' } },
        );
      });

      test('THEN the invite cannot be sent', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.sendInvite }),
        ).toBeDisabled();
      });
    });
  });

  describe('GIVEN the workspace owner with an invitation that fails', () => {
    beforeEach(() => {
      onInvite.mockResolvedValue(false);
      renderSection('u-owner', OWNER_ROLE);
      fireEvent.change(screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder), {
        target: { value: 'new@uniscept.dev' },
      });
    });

    describe('WHEN the invite is sent', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(
            screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.sendInvite }),
          );
        });
      });

      test('THEN the email stays for another try', () => {
        expect(
          screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder),
        ).toHaveValue('new@uniscept.dev');
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.members.sendInvite }),
        ).toBeEnabled();
      });
    });
  });
});
