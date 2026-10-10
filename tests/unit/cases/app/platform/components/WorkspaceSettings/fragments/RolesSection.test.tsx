import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspaceInvitation, IWorkspaceRole } from '@interfaces';

import { TRANSLATIONS } from '@mocks/i18n';
import {
  OWNER_ROLE,
  workspaceInvitation,
  CUSTOM_ROLES,
  HELPER_ROLE,
  MANAGER_ROLE,
  MEMBER_STEWARD_ROLE,
  STEWARD_ROLE,
  STEWARD_ROLES,
} from '@mocks/roles';
import { RolesSection } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onCreateRole = vi.fn();
const onUpdateRole = vi.fn();
const onDeleteRole = vi.fn();

const renderSection = (
  currentRole: IWorkspaceRole,
  roles: IWorkspaceRole[] = CUSTOM_ROLES,
  invitations: IWorkspaceInvitation[] = [],
) =>
  render(
    <RolesSection
      roles={roles}
      invitations={invitations}
      currentRole={currentRole}
      canManageRoles
      onCreateRole={onCreateRole}
      onUpdateRole={onUpdateRole}
      onDeleteRole={onDeleteRole}
    />,
  );

const actionButtons = (name: string) => screen.queryAllByRole('button', { name });

describe('RolesSection', () => {
  describe('GIVEN a role manager without workspace management', () => {
    beforeEach(() => {
      renderSection(MANAGER_ROLE);
    });

    describe('WHEN the role list renders', () => {
      test('THEN only the custom roles inside their ceiling offer edit and delete', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)).toHaveLength(2);
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)).toHaveLength(2);
      });
    });
  });

  describe('GIVEN the workspace owner', () => {
    beforeEach(() => {
      renderSection(OWNER_ROLE);
    });

    describe('WHEN the role list renders', () => {
      test('THEN every custom role offers edit and delete', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)).toHaveLength(3);
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)).toHaveLength(3);
      });
    });

    describe('WHEN a new role is named and created', () => {
      beforeEach(async () => {
        onCreateRole.mockResolvedValue(true);
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.newRole }));
        fireEvent.change(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }),
          { target: { value: 'Reviewers' } },
        );
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }));
        });
      });

      test('THEN the role is created and the list returns', () => {
        expect(onCreateRole).toHaveBeenCalledExactlyOnceWith('Reviewers', 'shield', expect.any(Object));
        expect(onUpdateRole).not.toHaveBeenCalled();
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)).toHaveLength(3);
      });
    });

    describe('WHEN a custom role is edited and saved', () => {
      beforeEach(async () => {
        onUpdateRole.mockResolvedValue(true);
        fireEvent.click(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)[1]!);
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.save }));
        });
      });

      test('THEN that role is updated with its own values', () => {
        expect(onUpdateRole).toHaveBeenCalledExactlyOnceWith('role-helper', 'Helper', 'shield', {
          canEditCanvas: true,
          canComment: true,
          canManageStructure: true,
          canManageMembers: false,
          canManageRoles: false,
          canManageWorkspace: false,
        });
        expect(onCreateRole).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the editor is opened and cancelled', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.newRole }));
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.cancel }));
      });

      test('THEN the list returns without saving', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)).toHaveLength(3);
        expect(onCreateRole).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a custom role delete is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)[0]!);
        fireEvent.click(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.deleteConfirm }),
        );
      });

      test('THEN that role is deleted', () => {
        expect(onDeleteRole).toHaveBeenCalledExactlyOnceWith('role-manager');
      });
    });
  });

  describe('GIVEN a member who cannot manage roles', () => {
    beforeEach(() => {
      render(
        <RolesSection
          roles={CUSTOM_ROLES}
          invitations={[]}
          currentRole={HELPER_ROLE}
          canManageRoles={false}
          onCreateRole={onCreateRole}
          onUpdateRole={onUpdateRole}
          onDeleteRole={onDeleteRole}
        />,
      );
    });

    describe('WHEN the role list renders', () => {
      test('THEN neither a new role nor any role action is offered', () => {
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.newRole }),
        ).not.toBeInTheDocument();
        expect(screen.queryAllByRole('button')).toEqual([]);
      });
    });
  });

  describe('GIVEN a role steward who can neither grant the Member role nor read pending invitations', () => {
    beforeEach(() => {
      renderSection(STEWARD_ROLE, STEWARD_ROLES);
    });

    describe('WHEN the role list renders', () => {
      test('THEN every role inside the ceiling stays editable', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.edit)).toHaveLength(3);
      });

      test('THEN no role offers delete, since even the role without members may hold pending invitations', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)).toHaveLength(0);
      });
    });
  });

  describe('GIVEN a role steward who manages members but cannot grant the Member role', () => {
    beforeEach(() => {
      renderSection(MEMBER_STEWARD_ROLE, STEWARD_ROLES);
    });

    describe('WHEN the role list renders', () => {
      test('THEN only the role nobody holds offers delete, since holders would fall back to Member', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)).toHaveLength(1);
      });
    });
  });

  describe('GIVEN a role steward who manages members but cannot grant the Member role, with an invitation pending on the empty role', () => {
    beforeEach(() => {
      renderSection(MEMBER_STEWARD_ROLE, STEWARD_ROLES, [{ ...workspaceInvitation('inv-1'), roleId: 'role-empty' }]);
    });

    describe('WHEN the role list renders', () => {
      test('THEN no role offers delete', () => {
        expect(actionButtons(TRANSLATIONS.platform.workspaceSettings.roles.delete)).toHaveLength(0);
      });
    });
  });
});
