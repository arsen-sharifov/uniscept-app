import { COPY, DEFAULT_WORKSPACE_NAME } from '../../consts';
import { expect, test } from '../../fixtures';
import {
  commitRename,
  confirmDelete,
  getStatusToast,
  getWorkspacePanel,
  getWorkspaceRow,
  getWorkspaceRows,
  getWorkspaceTrigger,
  openWorkspacePanel,
  runRowAction,
  seedWorkspace,
} from '../../utils';

test.describe('workspace creation', () => {
  test.describe('GIVEN a user with one workspace', () => {
    test.beforeEach(async ({ page, workspace }) => {
      await page.goto('/platform');
      await expect(getWorkspaceTrigger(page)).toContainText(workspace.name);
    });

    test.describe('WHEN another workspace is created from the switcher', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await panel.getByTitle(COPY.platform.sidebar.newWorkspace).click();
      });

      test('THEN the new workspace becomes the active one', async ({ page }) => {
        await expect(getStatusToast(page, COPY.platform.sidebar.workspaceCreated)).toBeVisible();
        await expect(getWorkspaceTrigger(page)).toContainText(DEFAULT_WORKSPACE_NAME);
      });

      test('THEN both workspaces are listed in the switcher that stays open', async ({ page, workspace }) => {
        const panel = getWorkspacePanel(page);

        await expect(panel).toBeVisible();

        await expect(getWorkspaceRows(panel)).toHaveCount(2);
        await expect(getWorkspaceRow(panel, workspace.name)).toBeVisible();
      });
    });
  });
});

test.describe('workspace switching', () => {
  test.describe('GIVEN a user with two workspaces', () => {
    test.beforeEach(async ({ page, account, workspace }) => {
      await seedWorkspace(account.id, 'Archive');
      await page.goto('/platform');
      await expect(getWorkspaceTrigger(page)).toContainText(workspace.name);
    });

    test.describe('WHEN the other workspace is picked', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await getWorkspaceRow(panel, 'Archive').getByRole('button').first().click();
      });

      test('THEN the switcher follows the selection', async ({ page }) => {
        await expect(getWorkspaceTrigger(page)).toContainText('Archive');
      });
    });

    test.describe('WHEN the other workspace is renamed from its row actions', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await runRowAction(getWorkspaceRow(panel, 'Archive'), COPY.platform.sidebar.rename);
        await commitRename(getWorkspacePanel(page), 'Cold storage');
      });

      test('THEN the panel lists the new name', async ({ page }) => {
        await expect(getStatusToast(page, COPY.platform.sidebar.workspaceRenamed)).toBeVisible();
        await expect(getWorkspacePanel(page)).toContainText('Cold storage');
      });
    });

    test.describe('WHEN the other workspace is deleted, the dialog is confirmed and the switcher is opened again', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await runRowAction(getWorkspaceRow(panel, 'Archive'), COPY.platform.sidebar.delete);
        await confirmDelete(page);
        await openWorkspacePanel(page);
      });

      test('THEN the deletion is confirmed and only the remaining workspace is listed', async ({ page, workspace }) => {
        const panel = getWorkspacePanel(page);

        await expect(getStatusToast(page, COPY.platform.sidebar.workspaceDeleted)).toBeVisible();
        await expect(getWorkspaceRow(panel, 'Archive')).toHaveCount(0);
        await expect(getWorkspaceRow(panel, workspace.name)).toBeVisible();
      });
    });
  });
});
