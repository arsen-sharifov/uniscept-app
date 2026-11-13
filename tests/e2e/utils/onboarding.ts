import { expect, type Locator, type Page } from '@playwright/test';

import { COPY, EXAMPLE_SCENES, ONBOARDING_ENDPOINT } from '../consts';

export const getTourOffer = (page: Page): Locator =>
  page.getByRole('dialog').filter({ hasText: COPY.platform.onboarding.offerTitle });

export const declineTourOffer = async (page: Page): Promise<void> => {
  await getTourOffer(page).getByRole('button', { name: COPY.platform.onboarding.offerDecline }).click();
};

export const waitForOnboardingSave = async (page: Page): Promise<void> => {
  const response = await page.waitForResponse(
    (candidate) => candidate.url().includes(ONBOARDING_ENDPOINT) && candidate.request().method() === 'POST',
  );

  expect(response.ok(), `Onboarding save failed with ${response.status()}`).toBe(true);
};

export const getGuidePicker = (page: Page): Locator =>
  page.getByRole('dialog').filter({ hasText: COPY.platform.onboarding.pickerBody });

export const getTourHint = (page: Page): Locator =>
  page
    .getByRole('dialog')
    .filter({ has: page.getByRole('button', { name: COPY.platform.onboarding.continueHint.dismiss }) });

export const getStepCard = (page: Page, title: string): Locator => page.getByRole('dialog', { name: title });

export const getHelpMenu = (page: Page): Locator =>
  page.getByRole('menu', { name: COPY.platform.onboarding.menuLabel });

export const openHelpMenu = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: COPY.platform.onboarding.menuLabel, exact: true }).click();
  await expect(getHelpMenu(page)).toBeVisible();
};

export const runHelpAction = async (page: Page, action: string): Promise<void> => {
  await openHelpMenu(page);
  await getHelpMenu(page).getByRole('menuitem', { name: action }).click();
};

export const readOnStep = async (page: Page, title: string): Promise<void> => {
  const card = getStepCard(page, title);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: COPY.platform.onboarding.stepNext }).click();
};

export const walkToQuestionStep = async (page: Page): Promise<void> => {
  await readOnStep(page, COPY.platform.onboarding.steps.baseIntro.title);
  await readOnStep(page, COPY.platform.onboarding.steps.baseWorkspace.title);
  await readOnStep(page, COPY.platform.onboarding.steps.baseThread.title);
};

export const getGuideRow = (page: Page, title: string): Locator =>
  getGuidePicker(page)
    .getByRole('listitem')
    .filter({ has: page.getByText(title, { exact: true }) })
    .getByRole('button');

export const startBasePass = async (page: Page): Promise<void> => {
  await runHelpAction(page, COPY.platform.onboarding.menuGuides);
  await getGuideRow(page, COPY.platform.onboarding.guides.baseTitle).click();
};

const walkExampleScenes = async (page: Page, scenes: typeof EXAMPLE_SCENES): Promise<void> => {
  await runHelpAction(page, COPY.platform.onboarding.menuGuides);
  await getGuideRow(page, COPY.platform.onboarding.guides.exampleTitle).click();
  await scenes.reduce(async (previous, scene) => {
    await previous;
    await readOnStep(page, COPY.platform.onboarding.steps[scene].title);
  }, Promise.resolve());
};

export const watchExample = (page: Page): Promise<void> => walkExampleScenes(page, EXAMPLE_SCENES);

export const watchExampleUntil = async (page: Page, scene: (typeof EXAMPLE_SCENES)[number]): Promise<void> => {
  await walkExampleScenes(page, EXAMPLE_SCENES.slice(0, EXAMPLE_SCENES.indexOf(scene)));
  await expect(
    getStepCard(page, COPY.platform.onboarding.steps[scene].title).getByRole('button', {
      name: COPY.platform.onboarding.stepNext,
    }),
  ).toBeEnabled();
};
