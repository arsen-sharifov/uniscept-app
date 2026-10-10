import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS, translate } from '@mocks/i18n';
import { MEMBER_ROLE, EDITOR_ROLE } from '@mocks/roles';
import { RoleListItem } from '@/app/platform/components/WorkspaceSettings/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onEdit = vi.fn();
const onDelete = vi.fn();

const listedPermissions = () =>
  within(screen.getByRole('list', { name: TRANSLATIONS.platform.workspaceSettings.roles.permissionsLabel }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

describe('RoleListItem', () => {
  describe('GIVEN a role that grants editing and commenting only', () => {
    beforeEach(() => {
      render(
        <RoleListItem role={EDITOR_ROLE} canManage={false} canDelete={false} onEdit={onEdit} onDelete={onDelete} />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the granted permissions are listed by name for assistive technology', () => {
        expect(listedPermissions()).toEqual([
          TRANSLATIONS.platform.workspaceSettings.permissions.canEditCanvas.name,
          TRANSLATIONS.platform.workspaceSettings.permissions.canComment.name,
        ]);
      });

      test('THEN the decorative permission pips and their tooltips stay out of the accessibility tree', () => {
        expect(screen.queryAllByRole('tooltip')).toEqual([]);
      });

      test('THEN its single member is counted in the singular', () => {
        expect(
          screen.getByText(translate('platform.workspaceSettings.roles.memberCount', { count: 1 })),
        ).toBeInTheDocument();
      });

      test('THEN it offers no action to a member who cannot manage it', () => {
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a custom role the member may manage and delete', () => {
    beforeEach(() => {
      render(<RoleListItem role={EDITOR_ROLE} canManage canDelete onEdit={onEdit} onDelete={onDelete} />);
    });

    describe('WHEN edit is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.edit }));
      });

      test('THEN the role opens in the editor', () => {
        expect(onEdit).toHaveBeenCalledExactlyOnceWith(EDITOR_ROLE);
      });
    });

    describe('WHEN delete is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.delete }));
      });

      test('THEN an inline confirmation replaces the actions without deleting yet', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.deleteConfirm }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.edit }),
        ).not.toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the delete is confirmed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.delete }));
        fireEvent.click(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.deleteConfirm }),
        );
      });

      test('THEN the role is deleted and the actions return', () => {
        expect(onDelete).toHaveBeenCalledExactlyOnceWith('role-editor');
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.edit }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the delete is cancelled', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.delete }));
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.cancel }));
      });

      test('THEN nothing is deleted and the actions return', () => {
        expect(onDelete).not.toHaveBeenCalled();
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.delete }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a custom role the member may manage but not delete', () => {
    beforeEach(() => {
      render(<RoleListItem role={EDITOR_ROLE} canManage canDelete={false} onEdit={onEdit} onDelete={onDelete} />);
    });

    describe('WHEN it renders', () => {
      test('THEN only edit is offered', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.edit }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.delete }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a system role the member may manage', () => {
    beforeEach(() => {
      render(<RoleListItem role={MEMBER_ROLE} canManage canDelete onEdit={onEdit} onDelete={onDelete} />);
    });

    describe('WHEN it renders', () => {
      test('THEN it is marked as locked with its translated name and offers no action', () => {
        expect(screen.getByText(TRANSLATIONS.platform.workspaceSettings.roles.systemLocked)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.workspaceSettings.roleNames.member)).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });
});
