import type { BrowserContext, Page } from '@playwright/test';

import { COPY, LEFT_WORKSPACE_NAME, OWN_THREAD_NAME, SIGNED_OUT_STATE } from '../../consts';
import { expect, test } from '../../fixtures';
import type { IE2ESeededAccount, IE2EThread, IE2EWorkspace } from '../../interfaces';
import {
  deleteAccount,
  getNavItem,
  getNode,
  getStatusToast,
  getWorkspacePanel,
  getWorkspaceRow,
  getWorkspaceSettingsModal,
  getWorkspaceTrigger,
  openSection,
  openWorkspacePanel,
  openWorkspaceSettings,
  seedAccount,
  seedMember,
  seedNodes,
  seedThread,
  seedWorkspace,
  signIn,
  uniqueLabel,
  waitForCanvas,
} from '../../utils';

test.describe('leaving a workspace', () => {
  test.describe('GIVEN a member with a workspace of their own and a shared one, open on a shared thread with their node', () => {
    let host: IE2ESeededAccount;
    let shared: IE2EWorkspace;
    let thread: IE2EThread;

    test.beforeEach(async ({ page, account, workspace }) => {
      host = await seedAccount(uniqueLabel('host'));
      shared = await seedWorkspace(host.id, LEFT_WORKSPACE_NAME);
      await seedMember(shared.id, account.id, 'member');
      await seedThread(workspace.id, OWN_THREAD_NAME, account.id);
      thread = await seedThread(shared.id, 'Shared thread', host.id, { question: 'Who stays on the team?' });
      await seedNodes(thread.id, account.id, [{ label: 'Member idea', x: 460, y: 440 }]);
      await page.goto(`/platform/${shared.id}/${thread.id}`);
      await waitForCanvas(page);
      await expect(getWorkspaceTrigger(page)).toContainText(LEFT_WORKSPACE_NAME);
    });

    test.afterEach(async () => {
      await deleteAccount(host.id);
    });

    test.describe('WHEN they leave it from its settings', () => {
      test.beforeEach(async ({ page }) => {
        const modal = await openWorkspaceSettings(page, LEFT_WORKSPACE_NAME);
        await modal.getByRole('button', { name: COPY.platform.workspaceSettings.general.leave, exact: true }).click();
      });

      test('THEN the settings close and their own workspace takes over', async ({ page, workspace }) => {
        await expect(getStatusToast(page, COPY.platform.workspaceSettings.general.left)).toBeVisible();
        await expect(getWorkspaceSettingsModal(page)).toHaveCount(0);
        await expect(getWorkspaceTrigger(page)).toContainText(workspace.name);
        await expect(getNavItem(page, OWN_THREAD_NAME)).toBeVisible();
      });
    });

    test.describe('WHEN they leave it, reload the page and open the workspace switcher', () => {
      test.beforeEach(async ({ page }) => {
        const modal = await openWorkspaceSettings(page, LEFT_WORKSPACE_NAME);
        await modal.getByRole('button', { name: COPY.platform.workspaceSettings.general.leave, exact: true }).click();
        await expect(getStatusToast(page, COPY.platform.workspaceSettings.general.left)).toBeVisible();
        await page.reload();
        await openWorkspacePanel(page);
      });

      test('THEN only their own workspace is listed', async ({ page, workspace }) => {
        await expect(getWorkspaceRow(getWorkspacePanel(page), LEFT_WORKSPACE_NAME)).toHaveCount(0);
        await expect(getWorkspaceRow(getWorkspacePanel(page), workspace.name)).toBeVisible();
      });
    });

    test.describe('WHEN they leave it and the host opens the shared thread', () => {
      let hostContext: BrowserContext;
      let hostPage: Page;

      test.beforeEach(async ({ page, browser, baseURL }) => {
        const modal = await openWorkspaceSettings(page, LEFT_WORKSPACE_NAME);
        await modal.getByRole('button', { name: COPY.platform.workspaceSettings.general.leave, exact: true }).click();
        await expect(getStatusToast(page, COPY.platform.workspaceSettings.general.left)).toBeVisible();
        hostContext = await browser.newContext({ baseURL, storageState: SIGNED_OUT_STATE });
        hostPage = await hostContext.newPage();
        await signIn(hostPage, host.email, host.password);
        await hostPage.goto(`/platform/${shared.id}/${thread.id}`);
        await waitForCanvas(hostPage);
      });

      test.afterEach(async () => {
        await hostContext.close();
      });

      test('THEN the node stays and names a former member as its author', async () => {
        await expect(getNode(hostPage, 'Member idea')).toContainText(COPY.platform.canvas.authorship.formerMember);
      });
    });
  });

  test.describe('GIVEN the signed-in owner of a workspace with one more member', () => {
    let member: IE2ESeededAccount;

    test.beforeEach(async ({ page, workspace }) => {
      member = await seedAccount(uniqueLabel('member'));
      await seedMember(workspace.id, member.id, 'member');
      await page.goto('/platform');
      await expect(getWorkspaceTrigger(page)).toContainText(workspace.name);
    });

    test.afterEach(async () => {
      await deleteAccount(member.id);
    });

    test.describe('WHEN they open the workspace settings', () => {
      test.beforeEach(async ({ page, workspace }) => {
        await openWorkspaceSettings(page, workspace.name);
      });

      test('THEN leaving stays locked until the ownership moves', async ({ page }) => {
        const modal = getWorkspaceSettingsModal(page);

        await expect(
          modal.getByRole('button', { name: COPY.platform.workspaceSettings.general.leave, exact: true }),
        ).toBeDisabled();
        await expect(modal).toContainText(COPY.platform.workspaceSettings.general.leaveOwnerHint);
      });
    });

    test.describe('WHEN they transfer the ownership to the member and then leave', () => {
      test.beforeEach(async ({ page, workspace }) => {
        const modal = await openWorkspaceSettings(page, workspace.name);
        await openSection(modal, COPY.platform.workspaceSettings.sections.members);
        await modal
          .getByRole('button', {
            name: `${COPY.platform.workspaceSettings.members.changeRole}: ${COPY.platform.workspaceSettings.roleNames.member}`,
          })
          .click();
        await modal.getByRole('option', { name: COPY.platform.workspaceSettings.roleNames.owner, exact: true }).click();
        await page
          .getByRole('alertdialog')
          .getByRole('button', { name: COPY.platform.workspaceSettings.members.transferConfirm, exact: true })
          .click();
        await expect(getStatusToast(page, COPY.platform.workspaceSettings.members.transferred)).toBeVisible();
        await openSection(modal, COPY.platform.workspaceSettings.sections.general);
        await modal.getByRole('button', { name: COPY.platform.workspaceSettings.general.leave, exact: true }).click();
      });

      test('THEN the workspace is gone and the platform offers to create one', async ({ page }) => {
        await expect(getStatusToast(page, COPY.platform.workspaceSettings.general.left)).toBeVisible();
        await expect(getWorkspaceSettingsModal(page)).toHaveCount(0);
        await expect(
          page.getByRole('main').getByText(COPY.platform.onboarding.emptyWorkspaceTitle, { exact: true }),
        ).toBeVisible();
      });
    });
  });
});
