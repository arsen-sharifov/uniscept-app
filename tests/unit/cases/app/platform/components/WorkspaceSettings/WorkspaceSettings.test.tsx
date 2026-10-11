import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IWorkspace } from '@interfaces';
import { getUser, getWorkspace, getWorkspaceInvitations, getWorkspaceMembers, getWorkspaceRoles } from '@api/client';
import { TRANSLATIONS } from '@mocks/i18n';
import { MEMBER_ROLE, OWNER_ROLE, workspaceMember } from '@mocks/roles';
import { WORKSPACE } from '@mocks/workspace';
import { WorkspaceSettings } from '@/app/platform/components/WorkspaceSettings';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const onRename = vi.fn();
const onClose = vi.fn();

describe('WorkspaceSettings', () => {
  describe('GIVEN workspace settings that are still loading', () => {
    beforeEach(() => {
      vi.mocked(getWorkspace).mockReturnValue(Promise.withResolvers<IWorkspace>().promise);
      render(
        <WorkspaceSettings workspaceId="ws-1" workspaceName="Product Lab" onRename={onRename} onClose={onClose} />,
      );
    });

    describe('WHEN the modal opens', () => {
      test('THEN the dialog is named by the heading of the active section', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.workspaceSettings.sections.general }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN another section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.sections.members }));
      });

      test('THEN the dialog name follows the heading', () => {
        expect(
          screen.getByRole('dialog', { name: TRANSLATIONS.platform.workspaceSettings.sections.members }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN loaded settings of a workspace the owner opened', () => {
    beforeEach(async () => {
      vi.mocked(getUser).mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null } as never);
      vi.mocked(getWorkspace).mockResolvedValue(WORKSPACE);
      vi.mocked(getWorkspaceRoles).mockResolvedValue([OWNER_ROLE, MEMBER_ROLE]);
      vi.mocked(getWorkspaceMembers).mockResolvedValue([
        workspaceMember('user-1', 'role-owner', { roleKey: 'owner', isOwner: true }),
        workspaceMember('user-2', 'role-member', { roleKey: 'member' }),
      ]);
      vi.mocked(getWorkspaceInvitations).mockResolvedValue([]);
      await act(async () => {
        render(
          <NextIntlClientProvider locale="en" timeZone="UTC">
            <WorkspaceSettings workspaceId="ws-1" workspaceName="Product Lab" onRename={onRename} onClose={onClose} />
          </NextIntlClientProvider>,
        );
      });
    });

    describe('WHEN the modal opens', () => {
      test('THEN the general section offers the rename with the workspace details', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.workspaceSettings.general.nameLabel }),
        ).toHaveValue('Product Lab');
        expect(screen.getByText(TRANSLATIONS.platform.workspaceSettings.roleNames.owner)).toBeInTheDocument();
        expect(screen.getByText('Mar 15, 2026')).toBeInTheDocument();
      });
    });

    describe('WHEN the members section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.sections.members }));
      });

      test('THEN the roster and the invite form show', () => {
        expect(screen.getByText('user-2@uniscept.dev')).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText(TRANSLATIONS.platform.workspaceSettings.members.emailPlaceholder),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the roles section is picked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.sections.roles }));
      });

      test('THEN the role list offers a new role', () => {
        expect(
          screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.roles.newRole }),
        ).toBeInTheDocument();
      });
    });

    describe('WHEN the close button is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.workspaceSettings.close }));
      });

      test('THEN the modal asks to close', () => {
        expect(onClose).toHaveBeenCalledOnce();
      });
    });
  });
});
