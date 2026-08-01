import { COPY } from '../../consts';
import { expect, test } from '../../fixtures';
import {
  addNodeAt,
  editQuestion,
  expectSaved,
  getEdges,
  getNode,
  getNodes,
  getPane,
  getQuestionNode,
  openNodeMenu,
  renameNode,
  seedEdge,
  seedNodes,
  seedThread,
  selectTool,
  waitForCanvas,
} from '../../utils';

const { canvas } = COPY.platform;
const { items: tools } = canvas.tools;

test.describe('central question', () => {
  test.describe('GIVEN a thread that already carries a question', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Question draft', account.id, { question: 'Old question?' });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN the question is rewritten on the central node', () => {
      test.beforeEach(async ({ page }) => {
        await editQuestion(page, 'Do we ship the beta in March?');
        await expectSaved(page);
      });

      test('THEN the node keeps the new question after a reload', async ({ page }) => {
        await page.reload();
        await waitForCanvas(page);

        await expect(getQuestionNode(page)).toContainText('Do we ship the beta in March?');
      });
    });
  });
});

test.describe('node building', () => {
  test.describe('GIVEN a thread canvas with only its question', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Build', account.id, { question: 'Where do we start?' });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN a node is dropped and renamed', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeAt(page, 480, 480);
        await expect(getNodes(page)).toHaveCount(1);
        await renameNode(page, getNodes(page).first(), 'Hire a designer');
        await expectSaved(page);
      });

      test('THEN the node survives a reload', async ({ page }) => {
        await page.reload();
        await waitForCanvas(page);

        await expect(getNode(page, 'Hire a designer')).toBeVisible();
      });
    });

    test.describe('WHEN a dropped node is undone', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeAt(page, 480, 480);
        await expect(getNodes(page)).toHaveCount(1);
        await selectTool(page, tools.undo.label);
      });

      test('THEN the canvas is back to the question alone', async ({ page }) => {
        await expect(getNodes(page)).toHaveCount(0);
        await expect(getQuestionNode(page)).toBeVisible();
      });
    });

    test.describe('WHEN an undone node is redone', () => {
      test.beforeEach(async ({ page }) => {
        await addNodeAt(page, 480, 480);
        await expect(getNodes(page)).toHaveCount(1);
        await selectTool(page, tools.undo.label);
        await expect(getNodes(page)).toHaveCount(0);
        await selectTool(page, tools.redo.label);
        await expectSaved(page);
      });

      test('THEN the node is back after a reload', async ({ page }) => {
        await expect(getNodes(page)).toHaveCount(1);

        await page.reload();
        await waitForCanvas(page);

        await expect(getNodes(page)).toHaveCount(1);
      });
    });

    test.describe('WHEN a node is added from the pane context menu', () => {
      test.beforeEach(async ({ page }) => {
        await getPane(page).click({ button: 'right', position: { x: 520, y: 420 } });
        const menu = page.getByRole('menu', { name: canvas.context.ariaLabel });
        await expect(menu).toBeVisible();
        await menu.getByRole('menuitem', { name: canvas.context.addNode }).click();
        await expectSaved(page);
      });

      test('THEN the node survives a reload', async ({ page }) => {
        await expect(getNodes(page)).toHaveCount(1);

        await page.reload();
        await waitForCanvas(page);

        await expect(getNodes(page)).toHaveCount(1);
      });
    });
  });
});

test.describe('node wiring', () => {
  test.describe('GIVEN a canvas with two unconnected nodes', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Wiring', account.id, { question: 'How does it connect?' });
      await seedNodes(thread.id, account.id, [
        { label: 'Cause', x: 380, y: 420 },
        { label: 'Effect', x: 800, y: 420 },
      ]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
      await expect(getEdges(page)).toHaveCount(0);
    });

    test.describe('WHEN the connect tool links them', () => {
      test.beforeEach(async ({ page }) => {
        await selectTool(page, tools.connect.label);
        await getNode(page, 'Cause').click();
        await getNode(page, 'Effect').click();
        await expectSaved(page);
      });

      test('THEN the edge survives a reload', async ({ page }) => {
        await expect(getEdges(page)).toHaveCount(1);

        await page.reload();
        await waitForCanvas(page);

        await expect(getEdges(page)).toHaveCount(1);
      });
    });
  });

  test.describe('GIVEN a canvas with two connected nodes', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Unwiring', account.id, { question: 'What disconnects?' });
      const [causeId, effectId] = await seedNodes(thread.id, account.id, [
        { label: 'Cause', x: 380, y: 420 },
        { label: 'Effect', x: 800, y: 420 },
      ]);
      await seedEdge(thread.id, causeId ?? '', effectId ?? '');
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
      await expect(getEdges(page)).toHaveCount(1);
    });

    test.describe('WHEN the edge is deleted from its context menu', () => {
      test.beforeEach(async ({ page }) => {
        await getEdges(page).first().click({ button: 'right', force: true });
        const menu = page.getByRole('menu', { name: canvas.context.ariaLabel });
        await expect(menu).toBeVisible();
        await menu.getByRole('menuitem', { name: canvas.context.deleteEdge }).click();
        await expectSaved(page);
      });

      test('THEN the nodes stay unconnected after a reload', async ({ page }) => {
        await expect(getEdges(page)).toHaveCount(0);

        await page.reload();
        await waitForCanvas(page);

        await expect(getEdges(page)).toHaveCount(0);
        await expect(getNodes(page)).toHaveCount(2);
      });
    });
  });
});

test.describe('node context menu', () => {
  test.describe('GIVEN a canvas holding a single node', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Context', account.id, { question: 'What else?' });
      await seedNodes(thread.id, account.id, [{ label: 'Original idea', x: 460, y: 440 }]);
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
    });

    test.describe('WHEN the node is duplicated from its context menu', () => {
      test.beforeEach(async ({ page }) => {
        const menu = await openNodeMenu(page, getNode(page, 'Original idea'));
        await menu.getByRole('menuitem', { name: canvas.context.duplicate }).click();
        await expectSaved(page);
      });

      test('THEN both copies survive a reload', async ({ page }) => {
        await page.reload();
        await waitForCanvas(page);

        await expect(getNode(page, 'Original idea')).toHaveCount(2);
      });
    });

    test.describe('WHEN the context menu opens without a validated parent in place', () => {
      test.beforeEach(async ({ page }) => {
        await openNodeMenu(page, getNode(page, 'Original idea'));
      });

      test('THEN marking the node valid is refused with a hint', async ({ page }) => {
        const menu = page.getByRole('menu', { name: canvas.context.ariaLabel });
        const markValid = menu.getByRole('menuitem', { name: new RegExp(canvas.context.markValid) });

        await expect(markValid).toBeDisabled();
        await expect(markValid).toContainText(canvas.context.needsValidParent);
      });
    });
  });
});
