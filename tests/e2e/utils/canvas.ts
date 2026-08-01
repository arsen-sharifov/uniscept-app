import { expect, type Locator, type Page } from '@playwright/test';

import {
  CANVAS_NODE_TYPE,
  COPY,
  EDGE_SELECTOR,
  NODE_SELECTOR,
  PANE_SELECTOR,
  QUESTION_NODE_TYPE,
  REFERENCE_NODE_TYPE,
} from '../consts';

const { canvas } = COPY.platform;

export const getPane = (page: Page): Locator => page.locator(PANE_SELECTOR);

export const getNodes = (page: Page): Locator => page.locator(`${NODE_SELECTOR}-${CANVAS_NODE_TYPE}`);

export const getNode = (page: Page, label: string): Locator => getNodes(page).filter({ hasText: label });

export const getQuestionNode = (page: Page): Locator => page.locator(`${NODE_SELECTOR}-${QUESTION_NODE_TYPE}`);

export const getReferenceNode = (page: Page): Locator => page.locator(`${NODE_SELECTOR}-${REFERENCE_NODE_TYPE}`);

export const getEdges = (page: Page): Locator => page.locator(EDGE_SELECTOR);

export const waitForCanvas = async (page: Page): Promise<void> => {
  await expect(getQuestionNode(page)).toBeVisible({ timeout: 30_000 });
};

export const expectSaved = async (page: Page): Promise<void> => {
  await expect(page.getByRole('status', { name: canvas.save.saved })).toBeVisible();
};

export const selectTool = async (page: Page, label: string): Promise<void> => {
  const toolbar = page.getByRole('complementary', { name: canvas.tools.ariaLabel });
  await toolbar.getByRole('button', { name: label, exact: true }).click();
};

export const addNodeAt = async (page: Page, x: number, y: number): Promise<void> => {
  await selectTool(page, canvas.tools.items.addNode.label);
  await getPane(page).click({ position: { x, y } });
};

const commitLabel = async (node: Locator, label: string): Promise<void> => {
  const editor = node.locator('textarea');
  await editor.click();
  await editor.fill(label);
  await editor.press('Enter');
  await expect(editor).toHaveCount(0);
};

export const renameNode = async (page: Page, node: Locator, label: string): Promise<void> => {
  await selectTool(page, canvas.tools.items.select.label);
  await node.dblclick();
  await commitLabel(node, label);
};

export const editQuestion = async (page: Page, label: string): Promise<void> => {
  await selectTool(page, canvas.tools.items.select.label);
  await getQuestionNode(page).dblclick();
  await commitLabel(getQuestionNode(page), label);
};

export const openNodeMenu = async (page: Page, node: Locator): Promise<Locator> => {
  await node.click({ button: 'right' });
  const menu = page.getByRole('menu', { name: canvas.context.ariaLabel });
  await expect(menu).toBeVisible();

  return menu;
};

export const addNodeComment = async (node: Locator, text: string): Promise<void> => {
  await node.hover();
  await node.getByRole('button', { name: canvas.node.addComment }).click();
  await node.getByPlaceholder(canvas.node.addCommentPlaceholder).fill(text);
  await node.getByRole('button', { name: canvas.node.sendComment }).click();
};
