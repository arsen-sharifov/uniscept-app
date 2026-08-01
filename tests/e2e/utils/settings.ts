import { expect, type Locator, type Page } from '@playwright/test';

import { COPY, PREFERENCES_ENDPOINT } from '../consts';
import { getWorkspaceRow, openWorkspacePanel, runRowAction } from './sidebar';

const { settings, sidebar, workspaceSettings } = COPY.platform;

const getUserMenuTrigger = (page: Page): Locator => page.locator('aside [aria-haspopup="dialog"]').last();

export const getSettingsModal = (page: Page): Locator =>
  page.getByRole('dialog').filter({ has: page.getByRole('button', { name: settings.close }) });

export const getWorkspaceSettingsModal = (page: Page): Locator =>
  page.getByRole('dialog').filter({ has: page.getByRole('button', { name: workspaceSettings.close }) });

export const openSettings = async (page: Page): Promise<Locator> => {
  await getUserMenuTrigger(page).click();
  await page.getByRole('dialog').getByRole('button', { name: settings.title, exact: true }).click();

  const modal = getSettingsModal(page);
  await expect(modal).toBeVisible();

  return modal;
};

export const openWorkspaceSettings = async (page: Page, workspaceName: string): Promise<Locator> => {
  const panel = await openWorkspacePanel(page);
  await runRowAction(getWorkspaceRow(panel, workspaceName), sidebar.workspaceSettings);

  const modal = getWorkspaceSettingsModal(page);
  await expect(modal).toBeVisible();

  return modal;
};

export const waitForPreferencesSave = async (page: Page): Promise<void> => {
  const response = await page.waitForResponse(
    (candidate) => candidate.url().includes(PREFERENCES_ENDPOINT) && candidate.request().method() === 'POST',
  );

  expect(response.ok(), `Preferences save failed with ${response.status()}`).toBe(true);
};

export const openSection = async (modal: Locator, name: string): Promise<void> => {
  await modal.getByRole('button', { name, exact: true }).click();
  await expect(modal.getByRole('heading', { name, exact: true })).toBeVisible();
};

export const inviteTeammate = async (modal: Locator, email: string): Promise<void> => {
  await openSection(modal, workspaceSettings.sections.members);
  await modal.getByPlaceholder(workspaceSettings.members.emailPlaceholder).fill(email);
  await modal.getByRole('button', { name: workspaceSettings.members.sendInvite, exact: true }).click();
  await expect(modal).toContainText(email);
};

export const createRole = async (modal: Locator, name: string): Promise<void> => {
  await openSection(modal, workspaceSettings.sections.roles);
  await modal.getByRole('button', { name: workspaceSettings.roles.newRole }).click();
  await modal.getByPlaceholder(workspaceSettings.roles.namePlaceholder).fill(name);
  await modal.getByRole('switch', { name: workspaceSettings.permissions.canComment.name }).click();
  await modal.getByRole('button', { name: workspaceSettings.roles.create, exact: true }).click();
  await expect(modal.getByRole('heading', { name, exact: true })).toBeVisible();
};
