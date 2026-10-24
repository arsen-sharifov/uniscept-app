import { COPY } from '../../consts';
import { expect, test as base } from '../../fixtures';
import type { IE2ESeededAccount } from '../../interfaces';
import {
  addNodeAt,
  deleteAccount,
  deleteAccountByEmail,
  expectSaved,
  getNode,
  getNodes,
  openNodeMenu,
  renameNode,
  seedAccount,
  seedMember,
  seedNodes,
  seedThread,
  selectTool,
  uniqueLabel,
  waitForCanvas,
} from '../../utils';

const test = base.extend<{ member: IE2ESeededAccount }>({
  member: async ({ workspace }, use) => {
    const member = await seedAccount(uniqueLabel('member'));
    await seedMember(workspace.id, member.id, 'member');

    await use(member);

    await deleteAccountByEmail(member.email);
  },
});

test.describe('node authorship', () => {
  test.describe('GIVEN a node the signed-in owner wrote and a node a member wrote', () => {
    test.beforeEach(async ({ page, workspace, account, member }) => {
      const thread = await seedThread(workspace.id, 'Authors', account.id, { question: 'Who wrote what?' });
      await seedNodes(thread.id, account.id, [{ label: 'Own idea', x: 460, y: 440 }]);
      await seedNodes(thread.id, member.id, [{ label: 'Member idea', x: 760, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN the canvas opens', () => {
      test('THEN each node names its author', async ({ page, account, member }) => {
        await expect(getNode(page, 'Own idea')).toContainText(account.name);
        await expect(getNode(page, 'Member idea')).toContainText(member.name);
      });
    });

    test.describe("WHEN the owner saves an edit, then double-clicks and types into the member's node and reloads", () => {
      test.beforeEach(async ({ page }) => {
        await renameNode(page, getNode(page, 'Own idea'), 'Own idea, sharpened');
        await expectSaved(page);
        await getNode(page, 'Member idea').dblclick();
        await page.keyboard.type('Simple');
        await page.keyboard.press('Enter');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test("THEN the member's text is unchanged and not marked edited", async ({ page, member }) => {
        await expect(getNode(page, 'Member idea').getByText('Member idea', { exact: true })).toBeVisible();
        await expect(getNode(page, 'Member idea')).not.toContainText('Simple');
        await expect(getNode(page, 'Member idea')).toContainText(member.name);
        await expect(getNode(page, 'Member idea')).not.toContainText(COPY.platform.canvas.authorship.edited);
      });
    });

    test.describe('WHEN the owner rewrites their own node and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        await renameNode(page, getNode(page, 'Own idea'), 'Own idea, sharpened');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the node is marked edited', async ({ page }) => {
        await expect(getNode(page, 'Own idea, sharpened')).toContainText(COPY.platform.canvas.authorship.edited);
      });
    });

    test.describe('WHEN the owner drops a node, writes its first text and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeAt(page, 620, 640);
        await expect(getNode(page, COPY.platform.canvas.node.placeholder)).toBeVisible();
        await renameNode(page, getNodes(page).last(), 'Fresh idea');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the first text names its author and is not marked edited', async ({ page, account }) => {
        await expect(getNode(page, 'Fresh idea')).toContainText(account.name);
        await expect(getNode(page, 'Fresh idea')).not.toContainText(COPY.platform.canvas.authorship.edited);
      });
    });

    test.describe("WHEN the owner deletes the member's node, undoes it and the page is reloaded", () => {
      test.beforeEach(async ({ page }) => {
        const menu = await openNodeMenu(page, getNode(page, 'Member idea'));
        await menu.getByRole('menuitem', { name: COPY.platform.canvas.context.delete }).click();
        await expect(getNode(page, 'Member idea')).toHaveCount(0);
        await expectSaved(page);
        await selectTool(page, COPY.platform.canvas.tools.items.undo.label);
        await expect(getNode(page, 'Member idea')).toBeVisible();
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the restored node still names the member', async ({ page, member }) => {
        await expect(getNode(page, 'Member idea')).toContainText(member.name);
      });
    });

    test.describe('WHEN the member deletes their account and the page is reloaded', () => {
      test.beforeEach(async ({ page, member }) => {
        await deleteAccount(member.id);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the node stays readable under the deleted account placeholder', async ({ page }) => {
        await expect(getNode(page, 'Member idea')).toContainText(COPY.platform.canvas.authorship.deletedAccount);
      });
    });
  });
});
