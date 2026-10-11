import { COPY, SHARED_WORKSPACE_NAME } from '../../consts';
import { expect, test } from '../../fixtures';
import {
  deleteAccount,
  getStatusToast,
  getWorkspacePanel,
  getWorkspaceRow,
  getWorkspaceTrigger,
  openWorkspacePanel,
  seedAccount,
  seedInvitation,
  seedWorkspace,
  uniqueLabel,
} from '../../utils';

test.describe('workspace invitations', () => {
  test.describe('GIVEN a pending invitation from another owner', () => {
    let hostId: string;

    test.beforeEach(async ({ page, account, workspace }) => {
      const host = await seedAccount(uniqueLabel('invhost'));
      hostId = host.id;
      const shared = await seedWorkspace(host.id, SHARED_WORKSPACE_NAME);
      await seedInvitation(shared.id, account.email, 'member');

      await page.goto('/platform');
      await expect(getWorkspaceTrigger(page)).toContainText(workspace.name);
    });

    test.afterEach(async () => {
      await deleteAccount(hostId);
    });

    test.describe('WHEN it is accepted from the workspace switcher and the switcher is opened again', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await panel.getByRole('button', { name: COPY.platform.sidebar.invitations.accept, exact: true }).click();
        await expect(panel).toBeHidden();
        await openWorkspacePanel(page);
      });

      test('THEN the acceptance is confirmed and the shared workspace joins the switcher list', async ({ page }) => {
        await expect(getStatusToast(page, COPY.platform.sidebar.invitations.accepted)).toBeVisible();
        await expect(getWorkspaceRow(getWorkspacePanel(page), SHARED_WORKSPACE_NAME)).toBeVisible();
      });
    });

    test.describe('WHEN it is declined', () => {
      test.beforeEach(async ({ page }) => {
        const panel = await openWorkspacePanel(page);
        await panel.getByRole('button', { name: COPY.platform.sidebar.invitations.decline, exact: true }).click();
      });

      test('THEN the invitation disappears and the workspace stays out of the list', async ({ page }) => {
        await expect(getStatusToast(page, COPY.platform.sidebar.invitations.declined)).toBeVisible();

        const panel = getWorkspacePanel(page);

        await expect(panel.getByText(COPY.platform.sidebar.invitations.title)).toHaveCount(0);
        await expect(getWorkspaceRow(panel, SHARED_WORKSPACE_NAME)).toHaveCount(0);
      });
    });
  });
});
