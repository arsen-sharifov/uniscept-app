import { COPY } from '../../consts';
import { expect, test } from '../../fixtures';
import { addNodeComment, expectSaved, getNode, seedNodes, seedThread, waitForCanvas } from '../../utils';

const { canvas } = COPY.platform;

test.describe('node comments', () => {
  test.describe('GIVEN a canvas node without comments', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Comments', account.id, { question: 'What do you think?' });
      await seedNodes(thread.id, account.id, [{ label: 'Risky bet', x: 460, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN a comment is posted on the node', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeComment(getNode(page, 'Risky bet'), 'Needs a cost estimate first.');
        await expectSaved(page);
      });

      test('THEN the comment is listed on the node after a reload', async ({ page }) => {
        await expect(getNode(page, 'Risky bet')).toContainText('Needs a cost estimate first.');

        await page.reload();
        await waitForCanvas(page);

        await expect(getNode(page, 'Risky bet').getByRole('button', { name: canvas.node.viewComments })).toContainText(
          '1',
        );
      });
    });

    test.describe('WHEN an own comment is posted and deleted again', () => {
      test.beforeEach(async ({ page }) => {
        const node = getNode(page, 'Risky bet');
        await addNodeComment(node, 'Scratch that.');
        await expect(node).toContainText('Scratch that.');
        await node.getByText('Scratch that.').hover();
        await node.getByRole('button', { name: canvas.comments.deleteAriaLabel }).click();
        await expectSaved(page);
      });

      test('THEN the node carries no comments after a reload', async ({ page }) => {
        await expect(getNode(page, 'Risky bet')).not.toContainText('Scratch that.');

        await page.reload();
        await waitForCanvas(page);

        await expect(getNode(page, 'Risky bet').getByRole('button', { name: canvas.node.viewComments })).toHaveCount(0);
      });
    });
  });
});
