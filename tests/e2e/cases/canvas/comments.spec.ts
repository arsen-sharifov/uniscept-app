import { COPY } from '../../consts';
import { expect, test } from '../../fixtures';
import { addNodeComment, expectSaved, getNode, seedNodes, seedThread, waitForCanvas } from '../../utils';

test.describe('node comments', () => {
  test.describe('GIVEN a canvas node without comments', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Comments', account.id, { question: 'What do you think?' });
      await seedNodes(thread.id, account.id, [{ label: 'Risky bet', x: 460, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN a comment is posted on the node and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeComment(getNode(page, 'Risky bet'), 'Needs a cost estimate first.');
        await expect(getNode(page, 'Risky bet')).toContainText('Needs a cost estimate first.');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the node still counts the comment', async ({ page }) => {
        await expect(
          getNode(page, 'Risky bet').getByRole('button', { name: COPY.platform.canvas.node.viewComments }),
        ).toContainText('1');
      });
    });

    test.describe('WHEN an own comment is posted, rewritten and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        const node = getNode(page, 'Risky bet');
        await addNodeComment(node, 'Needs an estimate.');
        await node.getByText('Needs an estimate.').hover();
        await node.getByRole('button', { name: COPY.platform.canvas.comments.editAriaLabel }).click();
        const editor = node.getByRole('textbox', { name: COPY.platform.canvas.comments.editorAriaLabel });
        await editor.fill('Needs a cost estimate by Friday.');
        await editor.press('Enter');
        await expect(editor).toHaveCount(0);
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
        await getNode(page, 'Risky bet').getByRole('button', { name: COPY.platform.canvas.node.viewComments }).click();
      });

      test('THEN the rewritten comment shows under its author marked edited', async ({ page, account }) => {
        const node = getNode(page, 'Risky bet');

        await expect(node).toContainText('Needs a cost estimate by Friday.');
        await expect(node.getByRole('article')).toContainText(account.name);
        await expect(node.getByRole('article')).toContainText(COPY.platform.canvas.authorship.edited);
      });
    });

    test.describe('WHEN an own comment is posted, deleted again and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        const node = getNode(page, 'Risky bet');
        await addNodeComment(node, 'Scratch that.');
        await expect(node).toContainText('Scratch that.');
        await node.getByText('Scratch that.').hover();
        await node.getByRole('button', { name: COPY.platform.canvas.comments.deleteAriaLabel }).click();
        await expect(node).not.toContainText('Scratch that.');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the node carries no comments', async ({ page }) => {
        await expect(
          getNode(page, 'Risky bet').getByRole('button', { name: COPY.platform.canvas.node.viewComments }),
        ).toHaveCount(0);
      });
    });
  });

  test.describe('GIVEN a node with a newer node right where its comments open', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Layers', account.id, { question: 'Which bet?' });
      await seedNodes(thread.id, account.id, [{ label: 'Risky bet', x: 460, y: 440 }]);
      await seedNodes(thread.id, account.id, [{ label: 'Safe bet', x: 720, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN the comments of the older node are opened', () => {
      test.beforeEach(async ({ page }) => {
        const node = getNode(page, 'Risky bet');
        await node.hover();
        await node.getByRole('button', { name: COPY.platform.canvas.node.addComment }).click();
        await expect(
          node.getByRole('textbox', { name: COPY.platform.canvas.node.addCommentPlaceholder }),
        ).toBeVisible();
      });

      test('THEN the panel sits on top of the newer node', async ({ page }) => {
        const box = await getNode(page, 'Safe bet').boundingBox();
        if (!box) throw new Error('The newer node is not on screen');

        const topmostIsPanel = await page.evaluate(
          ({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-tour="canvasCommentsPanel"]') !== null,
          { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        );

        expect(topmostIsPanel).toBe(true);
      });
    });
  });
});
