import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MAX_NAME_LENGTH } from '@constants';
import { TRANSLATIONS } from '@mocks/i18n';
import { FULL_ACCESS, workspaceRole, MANAGER_ROLE } from '@mocks/roles';
import { RoleEditor } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onSave = vi.fn();
const onCancel = vi.fn();

const permissionSwitch = (name: string) => screen.queryByRole('switch', { name });

describe('RoleEditor', () => {
  describe('GIVEN a role manager creating a role', () => {
    beforeEach(() => {
      render(<RoleEditor role={null} granter={MANAGER_ROLE} onSave={onSave} onCancel={onCancel} />);
    });

    describe('WHEN it renders', () => {
      test('THEN the name field is labelled and capped at the shared name length', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }),
        ).toHaveAttribute('maxlength', String(MAX_NAME_LENGTH));
      });

      test('THEN each icon is named in the interface language, with the default one checked', () => {
        expect(
          screen.getByRole('radio', { name: TRANSLATIONS.platform.workspaceSettings.roleIcons.shield }),
        ).toHaveAttribute('aria-checked', 'true');
        expect(
          screen.getByRole('radio', { name: TRANSLATIONS.platform.workspaceSettings.roleIcons.penTool }),
        ).toHaveAttribute('aria-checked', 'false');
      });

      test('THEN only the permissions the manager holds are offered', () => {
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canEditCanvas.name),
        ).toBeInTheDocument();
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageRoles.name),
        ).toBeInTheDocument();
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageMembers.name),
        ).not.toBeInTheDocument();
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageWorkspace.name),
        ).not.toBeInTheDocument();
      });

      test('THEN the role cannot be created without a name', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }),
        ).toBeDisabled();
      });
    });

    describe('WHEN a held permission is switched on', () => {
      beforeEach(() => {
        fireEvent.click(permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageRoles.name)!);
      });

      test('THEN the switch turns on', () => {
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageRoles.name),
        ).toHaveAttribute('aria-checked', 'true');
      });
    });

    describe('WHEN a named role with another icon and a permission is created', () => {
      beforeEach(async () => {
        onSave.mockResolvedValue(true);
        fireEvent.change(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }),
          { target: { value: '  Reviewers  ' } },
        );
        fireEvent.click(screen.getByRole('radio', { name: TRANSLATIONS.platform.workspaceSettings.roleIcons.penTool }));
        fireEvent.click(permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canComment.name)!);
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }));
        });
      });

      test('THEN the trimmed role is saved and the editor closes', () => {
        expect(onSave).toHaveBeenCalledExactlyOnceWith('Reviewers', 'penTool', {
          canEditCanvas: false,
          canComment: true,
          canManageStructure: false,
          canManageMembers: false,
          canManageRoles: false,
          canManageWorkspace: false,
        });
        expect(onCancel).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a role save that fails', () => {
    beforeEach(() => {
      onSave.mockResolvedValue(false);
      render(<RoleEditor role={null} granter={MANAGER_ROLE} onSave={onSave} onCancel={onCancel} />);
      fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }), {
        target: { value: 'Reviewers' },
      });
    });

    describe('WHEN the role is created', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }));
        });
      });

      test('THEN the editor stays open for another try', () => {
        expect(onCancel).not.toHaveBeenCalled();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }),
        ).toBeEnabled();
      });
    });
  });

  describe('GIVEN a role save that takes a while', () => {
    beforeEach(() => {
      onSave.mockReturnValue(Promise.withResolvers<boolean>().promise);
      render(<RoleEditor role={null} granter={MANAGER_ROLE} onSave={onSave} onCancel={onCancel} />);
      fireEvent.change(screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }), {
        target: { value: 'Reviewers' },
      });
    });

    describe('WHEN the role is created', () => {
      beforeEach(async () => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.create }));
        });
      });

      test('THEN the button reports the save and blocks a second one', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.saving }),
        ).toBeDisabled();
      });
    });
  });

  describe('GIVEN the workspace owner editing a custom role', () => {
    beforeEach(() => {
      render(
        <RoleEditor
          role={workspaceRole('role-custom', { name: 'Reviewers', icon: 'star', canManageStructure: false })}
          granter={FULL_ACCESS}
          onSave={onSave}
          onCancel={onCancel}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN every permission is offered', () => {
        expect(screen.getAllByRole('switch')).toHaveLength(
          Object.keys(TRANSLATIONS.platform.workspaceSettings.permissions).length,
        );
      });

      test('THEN the name, icon and permissions of the role are prefilled for saving', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.roles.nameLabel }),
        ).toHaveValue('Reviewers');
        expect(
          screen.getByRole('radio', { name: TRANSLATIONS.platform.workspaceSettings.roleIcons.star }),
        ).toHaveAttribute('aria-checked', 'true');
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canEditCanvas.name),
        ).toHaveAttribute('aria-checked', 'true');
        expect(
          permissionSwitch(TRANSLATIONS.platform.workspaceSettings.permissions.canManageStructure.name),
        ).toHaveAttribute('aria-checked', 'false');
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.save })).toBeEnabled();
      });
    });

    describe('WHEN the edit is cancelled', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.cancel }));
      });

      test('THEN the editor asks to close without saving', () => {
        expect(onCancel).toHaveBeenCalledOnce();
        expect(onSave).not.toHaveBeenCalled();
      });
    });
  });
});
