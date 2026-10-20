import { COPY } from '../../consts';
import { expect, test } from '../../fixtures';
import { doubleClickWord, expectSaved, getNode, seedNodes, seedThread, selectTool, waitForCanvas } from '../../utils';

test.describe('text formatting', () => {
  test.describe('GIVEN a canvas node with plain text', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Formatting', account.id, { question: 'What ships first?' });
      await seedNodes(thread.id, account.id, [{ label: 'Ship the beta', x: 460, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN one word is made bold, another is linked and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        await selectTool(page, COPY.platform.canvas.tools.items.select.label);
        const node = getNode(page, 'Ship the beta');
        await node.dblclick();
        const editor = node.getByRole('textbox', { name: COPY.platform.canvas.node.labelAriaLabel });
        await expect(editor).toBeFocused();

        const toolbar = page.getByRole('toolbar', { name: COPY.platform.canvas.formatting.toolbar });
        await doubleClickWord(page, editor, 'Ship');
        await toolbar.getByRole('button', { name: COPY.platform.canvas.formatting.bold }).click();
        await expect(editor.locator('strong')).toHaveText('Ship');

        await doubleClickWord(page, editor, 'beta');
        await expect(toolbar.getByRole('button', { name: COPY.platform.canvas.formatting.bold })).toHaveAttribute(
          'aria-pressed',
          'false',
        );
        await toolbar.getByRole('button', { name: COPY.platform.canvas.formatting.link }).click();
        await toolbar
          .getByRole('textbox', { name: COPY.platform.canvas.formatting.linkAddress })
          .fill('example.com/beta');
        await toolbar.getByRole('textbox', { name: COPY.platform.canvas.formatting.linkAddress }).press('Enter');

        await expect(editor).toBeFocused();
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the bold word and the link are still there', async ({ page }) => {
        const node = getNode(page, 'Ship the beta');

        await expect(node.locator('strong')).toHaveText('Ship');
        await expect(node.getByRole('link', { name: 'beta' })).toHaveAttribute('href', 'https://example.com/beta');
        await expect(node.getByRole('link', { name: 'beta' })).toHaveAttribute('target', '_blank');
      });
    });

    test.describe('WHEN a bulleted list is typed into the label and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        await selectTool(page, COPY.platform.canvas.tools.items.select.label);
        const node = getNode(page, 'Ship the beta');
        await node.dblclick();
        const editor = node.getByRole('textbox', { name: COPY.platform.canvas.node.labelAriaLabel });
        await expect(editor).toBeFocused();

        await page.keyboard.press('End');
        await page.keyboard.press('Shift+Enter');
        await page.keyboard.type('- Fix the onboarding');
        await page.keyboard.press('Enter');
        await page.keyboard.type('Price the plans');
        await page.keyboard.press('ControlOrMeta+Enter');
        await expect(editor).toHaveCount(0);
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
      });

      test('THEN the node shows the list under the first line', async ({ page }) => {
        const node = getNode(page, 'Ship the beta');

        await expect(node.getByRole('listitem')).toHaveText(['Fix the onboarding', 'Price the plans']);
      });
    });
  });

  test.describe('GIVEN a canvas node open for comments', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Comment formatting', account.id, { question: 'Which bet?' });
      await seedNodes(thread.id, account.id, [{ label: 'Risky bet', x: 460, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN a comment with a bold word is posted and the page is reloaded', () => {
      test.beforeEach(async ({ page }) => {
        const node = getNode(page, 'Risky bet');
        await node.hover();
        await node.getByRole('button', { name: COPY.platform.canvas.node.addComment }).click();
        const composer = node.getByRole('textbox', { name: COPY.platform.canvas.node.addCommentPlaceholder });
        await composer.click();
        await page.keyboard.type('Check the ');
        await page.keyboard.press('ControlOrMeta+b');
        await page.keyboard.type('budget');
        await page.keyboard.press('Enter');
        await expect(node.locator('[data-tour="canvasCommentsPanel"] strong')).toHaveText('budget');
        await expectSaved(page);
        await page.reload();
        await waitForCanvas(page);
        await getNode(page, 'Risky bet').hover();
        await getNode(page, 'Risky bet').getByRole('button', { name: COPY.platform.canvas.node.viewComments }).click();
      });

      test('THEN the comment keeps its bold word', async ({ page }) => {
        await expect(getNode(page, 'Risky bet').locator('[data-tour="canvasCommentsPanel"] strong')).toHaveText(
          'budget',
        );
      });
    });
  });
});
