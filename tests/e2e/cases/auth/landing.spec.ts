import { COPY } from '../../consts';
import { expect, guestTest as test } from '../../fixtures';

const { landing } = COPY;

test.describe('landing page', () => {
  test.describe('GIVEN a visitor without a session', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test.describe('WHEN the landing page finishes loading', () => {
      test('THEN it shows the hero pitch', async ({ page }) => {
        await expect(page.getByRole('heading', { name: landing.hero.title })).toBeVisible();
        await expect(page.getByText(landing.hero.tagline)).toBeVisible();
      });

      test('THEN it lists every pricing plan', async ({ page }) => {
        const { demo, lite, standard, pro } = landing.pricing.plans;

        await expect(page.getByRole('heading', { name: demo.name, exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: lite.name, exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: standard.name, exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: pro.name, exact: true })).toBeVisible();
      });
    });

    test.describe('WHEN the header sign-in link is followed', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('banner').getByRole('link', { name: landing.header.signIn }).click();
      });

      test('THEN the sign-in form opens', async ({ page }) => {
        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByRole('heading', { name: COPY.auth.signIn.heading })).toBeVisible();
      });
    });

    test.describe('WHEN the header call to action is followed', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('banner').getByRole('link', { name: landing.header.getStarted }).click();
      });

      test('THEN the sign-up flow opens on the plan step', async ({ page }) => {
        await expect(page).toHaveURL(/\/signup$/);
        await expect(page.getByRole('heading', { name: COPY.auth.signUp.planStep.heading })).toBeVisible();
      });
    });
  });
});
