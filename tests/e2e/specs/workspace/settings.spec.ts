import { COPY, E2E_ACCOUNT_DOMAIN } from '../../consts';
import { expect, test } from '../../fixtures';
import type { IE2ESeededAccount } from '../../interfaces';
import {
  createRole,
  deleteAccount,
  deleteAccountByEmail,
  getStatusToast,
  getWorkspaceSettingsModal,
  getWorkspaceTrigger,
  inviteTeammate,
  openSection,
  openWorkspaceSettings,
  seedAccount,
  seedMember,
  uniqueLabel,
} from '../../utils';

const { sidebar, workspaceSettings } = COPY.platform;
const { general, members, roleNames, roles, sections } = workspaceSettings;

const uniqueTeammateEmail = () => `${uniqueLabel('teammate')}@${E2E_ACCOUNT_DOMAIN}`;

const CUSTOM_ROLE = 'Reviewer';

test.describe('workspace general settings', () => {
  test.describe('GIVEN the workspace settings dialog', () => {
    test.beforeEach(async ({ page, workspace }) => {
      await page.goto('/platform');
      await openWorkspaceSettings(page, workspace.name);
    });

    test.describe('WHEN the workspace is renamed and saved', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await modal.getByLabel(general.nameLabel).fill('Renamed workspace');
        await modal.getByRole('button', { name: general.save, exact: true }).click();
      });

      test('THEN the switcher follows the new name', async ({ page }) => {
        await expect(getStatusToast(page, sidebar.workspaceRenamed)).toBeVisible();
        await expect(getWorkspaceTrigger(page)).toContainText('Renamed workspace');
      });
    });

    test.describe('WHEN the members section is opened', () => {
      test.beforeEach(async ({ page }) => {
        await openSection(getWorkspaceSettingsModal(page), sections.members);
      });

      test('THEN the creator is listed as the owner', async ({ page, account }) => {
        const modal = getWorkspaceSettingsModal(page);

        await expect(modal).toContainText(account.email);
        await expect(modal).toContainText(members.you);
        await expect(modal).toContainText(roleNames.owner);
      });
    });

    test.describe('WHEN a teammate is invited by email', () => {
      let teammateEmail: string;

      test.beforeEach(async ({ page }) => {
        teammateEmail = uniqueTeammateEmail();
        await inviteTeammate(getWorkspaceSettingsModal(page), teammateEmail);
      });

      test.afterEach(async () => {
        await deleteAccountByEmail(teammateEmail);
      });

      test('THEN the invitation is listed as pending', async ({ page }) => {
        await expect(getStatusToast(page, members.invited)).toBeVisible();
        await expect(getWorkspaceSettingsModal(page)).toContainText(teammateEmail);
      });
    });

    test.describe('WHEN the pending invitation is revoked', () => {
      let teammateEmail: string;

      test.beforeEach(async ({ page }) => {
        teammateEmail = uniqueTeammateEmail();
        const modal = getWorkspaceSettingsModal(page);
        await inviteTeammate(modal, teammateEmail);
        await modal.getByRole('button', { name: members.revoke, exact: true }).click();
      });

      test.afterEach(async () => {
        await deleteAccountByEmail(teammateEmail);
      });

      test('THEN it is gone from the members section', async ({ page }) => {
        await expect(getStatusToast(page, members.revoked)).toBeVisible();
        await expect(getWorkspaceSettingsModal(page)).not.toContainText(teammateEmail);
      });
    });

    test.describe('WHEN the roles section is opened', () => {
      test.beforeEach(async ({ page }) => {
        await openSection(getWorkspaceSettingsModal(page), sections.roles);
      });

      test('THEN the built-in roles are locked against editing', async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);

        await expect(modal.getByText(roles.systemLocked, { exact: true })).toHaveCount(3);
        await expect(modal.getByRole('button', { name: roles.edit, exact: true })).toHaveCount(0);
      });
    });

    test.describe('WHEN a custom role is created', () => {
      test.beforeEach(async ({ page }) => {
        await createRole(getWorkspaceSettingsModal(page), CUSTOM_ROLE);
      });

      test('THEN it joins the role list', async ({ page }) => {
        await expect(getStatusToast(page, roles.created)).toBeVisible();
        await expect(
          getWorkspaceSettingsModal(page).getByRole('heading', { name: CUSTOM_ROLE, exact: true }),
        ).toBeVisible();
      });
    });

    test.describe('WHEN the custom role is renamed through its editor', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await createRole(modal, CUSTOM_ROLE);
        await modal.getByRole('button', { name: roles.edit, exact: true }).click();
        await modal.getByPlaceholder(roles.namePlaceholder).fill('Auditor');
        await modal.getByRole('button', { name: roles.save, exact: true }).click();
      });

      test('THEN the role list shows the new name', async ({ page }) => {
        await expect(getStatusToast(page, roles.updated)).toBeVisible();
        await expect(
          getWorkspaceSettingsModal(page).getByRole('heading', { name: 'Auditor', exact: true }),
        ).toBeVisible();
      });
    });

    test.describe('WHEN the custom role is deleted again', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await createRole(modal, CUSTOM_ROLE);
        await modal.getByRole('button', { name: roles.delete, exact: true }).click();
        await modal.getByRole('button', { name: roles.deleteConfirm, exact: true }).click();
      });

      test('THEN it is gone from the role list', async ({ page }) => {
        await expect(getStatusToast(page, roles.deleted)).toBeVisible();
        await expect(
          getWorkspaceSettingsModal(page).getByRole('heading', { name: CUSTOM_ROLE, exact: true }),
        ).toHaveCount(0);
      });
    });
  });
});

test.describe('workspace members management', () => {
  test.describe('GIVEN the members section listing a seeded member', () => {
    let member: IE2ESeededAccount;

    test.beforeEach(async ({ page, workspace }) => {
      member = await seedAccount(uniqueLabel('member'));
      await seedMember(workspace.id, member.id, 'member');

      await page.goto('/platform');
      const modal = await openWorkspaceSettings(page, workspace.name);
      await openSection(modal, sections.members);
      await expect(modal).toContainText(member.email);
    });

    test.afterEach(async () => {
      await deleteAccount(member.id);
    });

    test.describe('WHEN the member is switched to the viewer role', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await modal.getByRole('button', { name: `${members.changeRole}: ${roleNames.member}` }).click();
        await modal.getByRole('option', { name: roleNames.viewer, exact: true }).click();
      });

      test('THEN the member row reports the viewer role', async ({ page }) => {
        await expect(getStatusToast(page, members.roleChanged)).toBeVisible();
        await expect(
          getWorkspaceSettingsModal(page).getByRole('button', { name: `${members.changeRole}: ${roleNames.viewer}` }),
        ).toBeVisible();
      });
    });

    test.describe('WHEN the member is removed after the inline confirmation', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await modal.getByRole('button', { name: members.remove, exact: true }).click();
        await expect(modal.getByRole('button', { name: members.cancel, exact: true })).toBeVisible();
        await modal.getByRole('button', { name: members.removeConfirm, exact: true }).click();
      });

      test('THEN they are gone from the members list', async ({ page }) => {
        await expect(getStatusToast(page, members.removed)).toBeVisible();
        await expect(getWorkspaceSettingsModal(page)).not.toContainText(member.email);
      });
    });

    test.describe('WHEN ownership is transferred to the member', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);
        await modal.getByRole('button', { name: `${members.changeRole}: ${roleNames.member}` }).click();
        await modal.getByRole('option', { name: roleNames.owner, exact: true }).click();
        const dialog = page.getByRole('alertdialog');
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: members.transferConfirm, exact: true }).click();
      });

      test('THEN the previous owner loses the management controls', async ({ page }) => {
        await expect(getStatusToast(page, members.transferred)).toBeVisible();

        const modal = getWorkspaceSettingsModal(page);

        await expect(modal.getByText(roleNames.owner, { exact: true })).toBeVisible();
        await expect(modal.getByRole('button', { name: members.remove, exact: true })).toHaveCount(0);
      });
    });
  });
});
