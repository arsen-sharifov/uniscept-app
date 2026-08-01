import { COPY, COPY_UK, VIEWPORT_SELECTOR } from '../../consts';
import { expect, guestTest, test } from '../../fixtures';
import type { IE2ESeededAccount } from '../../interfaces';
import {
  deleteAccountByEmail,
  getErrorToast,
  getSettingsModal,
  getSidebar,
  openSection,
  openSettings,
  seedAccount,
  seedThread,
  signIn,
  signOut,
  uniqueLabel,
  waitForCanvas,
  waitForPreferencesSave,
} from '../../utils';

const { settings } = COPY.platform;
const { appearance, editor, profile, sections, security } = settings;

const NEW_PASSWORD = 'Uniscept-E2E-2!';

test.describe('appearance preferences', () => {
  test.describe('GIVEN the settings dialog on its appearance section', () => {
    test.beforeEach(async ({ page, workspace }) => {
      await page.goto('/platform');
      await expect(getSidebar(page)).toContainText(workspace.name);
      const modal = await openSettings(page);
      await openSection(modal, sections.appearance);
    });

    test.describe('WHEN another theme is picked', () => {
      test.beforeEach(async ({ page }) => {
        const saved = waitForPreferencesSave(page);
        await page.getByRole('radio', { name: appearance.themeEclipse }).click();
        await saved;
      });

      test('THEN the app repaints and keeps the theme after a reload', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'eclipse');

        await page.reload();

        await expect(page.locator('html')).toHaveAttribute('data-theme', 'eclipse');
      });
    });

    test.describe('WHEN another language is picked', () => {
      test.beforeEach(async ({ page }) => {
        const saved = waitForPreferencesSave(page);
        await page.getByRole('button', { name: appearance.languages.uk, exact: true }).click();
        await saved;
      });

      test('THEN the interface is translated and stays translated after a reload', async ({ page }) => {
        await expect(page.getByRole('heading', { name: COPY_UK.platform.settings.sections.appearance })).toBeVisible();

        await page.reload();

        await expect(getSidebar(page)).toContainText(COPY_UK.platform.sidebar.structure);
      });
    });

    test.describe('WHEN another canvas pattern is picked', () => {
      test.beforeEach(async ({ page }) => {
        const saved = waitForPreferencesSave(page);
        await page.getByRole('radio', { name: appearance.patternLines }).click();
        await saved;
      });

      test('THEN the canvas texture changes and survives a reload', async ({ page }) => {
        await expect(page.locator('html')).toHaveAttribute('data-canvas-pattern', 'lines');

        await page.reload();

        await expect(page.locator('html')).toHaveAttribute('data-canvas-pattern', 'lines');
      });
    });
  });
});

test.describe('editor preferences', () => {
  test.describe('GIVEN the settings dialog on its editor section', () => {
    test.beforeEach(async ({ page, workspace, account }) => {
      const thread = await seedThread(workspace.id, 'Preferences', account.id, { question: 'Snap or not?' });
      await page.goto(`/platform/${workspace.id}/${thread.id}`);
      await waitForCanvas(page);
      const modal = await openSettings(page);
      await openSection(modal, sections.editor);
    });

    test.describe('WHEN snap to grid is switched on', () => {
      test.beforeEach(async ({ page }) => {
        const saved = waitForPreferencesSave(page);
        await page.getByRole('switch', { name: editor.snapToGrid }).click();
        await saved;
      });

      test('THEN the switch stays on after a reload', async ({ page }) => {
        await expect(page.getByRole('switch', { name: editor.snapToGrid })).toHaveAttribute('aria-checked', 'true');

        await page.reload();
        await waitForCanvas(page);
        const modal = await openSettings(page);
        await openSection(modal, sections.editor);

        await expect(page.getByRole('switch', { name: editor.snapToGrid })).toHaveAttribute('aria-checked', 'true');
      });
    });

    test.describe('WHEN smart guides are switched off', () => {
      test.beforeEach(async ({ page }) => {
        await expect(page.getByRole('switch', { name: editor.smartGuides })).toHaveAttribute('aria-checked', 'true');
        const saved = waitForPreferencesSave(page);
        await page.getByRole('switch', { name: editor.smartGuides }).click();
        await saved;
      });

      test('THEN the switch stays off after a reload', async ({ page }) => {
        await expect(page.getByRole('switch', { name: editor.smartGuides })).toHaveAttribute('aria-checked', 'false');

        await page.reload();
        await waitForCanvas(page);
        const modal = await openSettings(page);
        await openSection(modal, sections.editor);

        await expect(page.getByRole('switch', { name: editor.smartGuides })).toHaveAttribute('aria-checked', 'false');
      });
    });

    test.describe('WHEN another default zoom level is picked', () => {
      test.beforeEach(async ({ page }) => {
        const saved = waitForPreferencesSave(page);
        await page.getByRole('radiogroup', { name: editor.defaultZoom }).getByRole('radio', { name: /125/ }).click();
        await saved;
      });

      test('THEN the choice stays picked after a reload', async ({ page }) => {
        await page.reload();
        await waitForCanvas(page);
        const modal = await openSettings(page);
        await openSection(modal, sections.editor);

        await expect(
          page.getByRole('radiogroup', { name: editor.defaultZoom }).getByRole('radio', { name: /125/ }),
        ).toHaveAttribute('aria-checked', 'true');
      });

      test('THEN the canvas opens at the chosen zoom after a reload', async ({ page }) => {
        await page.reload();
        await waitForCanvas(page);

        await expect(page.locator(VIEWPORT_SELECTOR)).toHaveAttribute('style', /scale\(1\.25\)/);
      });
    });
  });
});

guestTest.describe('security', () => {
  guestTest.describe('GIVEN a throwaway account on the security section', () => {
    let disposable: IE2ESeededAccount;

    guestTest.beforeEach(async ({ page }) => {
      disposable = await seedAccount(uniqueLabel('sec'));
      await signIn(page, disposable.email, disposable.password);
      const modal = await openSettings(page);
      await openSection(modal, sections.security);
    });

    guestTest.afterEach(async () => {
      await deleteAccountByEmail(disposable.email);
    });

    guestTest.describe('WHEN the password is changed and the account signs back in with it', () => {
      guestTest.beforeEach(async ({ page }) => {
        const modal = getSettingsModal(page);
        await modal.getByLabel(security.currentPassword).fill(disposable.password);
        await modal.getByLabel(security.newPassword, { exact: true }).fill(NEW_PASSWORD);
        await modal.getByLabel(security.confirmPassword).fill(NEW_PASSWORD);
        await modal.getByRole('button', { name: security.updatePassword, exact: true }).click();
        await expect(modal.getByText(security.passwordUpdated, { exact: true })).toBeVisible();
        await modal.getByRole('button', { name: settings.close }).click();
        await signOut(page);
        await signIn(page, disposable.email, NEW_PASSWORD);
      });

      guestTest('THEN the platform opens for the new credentials', async ({ page }) => {
        await expect(page).toHaveURL(/\/platform/);
        await expect(getSidebar(page)).toBeVisible();
      });
    });

    guestTest.describe('WHEN the wrong current password is submitted', () => {
      guestTest.beforeEach(async ({ page }) => {
        const modal = getSettingsModal(page);
        await modal.getByLabel(security.currentPassword).fill('definitely-not-the-password');
        await modal.getByLabel(security.newPassword, { exact: true }).fill(NEW_PASSWORD);
        await modal.getByLabel(security.confirmPassword).fill(NEW_PASSWORD);
        await modal.getByRole('button', { name: security.updatePassword, exact: true }).click();
      });

      guestTest('THEN the form refuses the change inline', async ({ page }) => {
        await expect(
          getSettingsModal(page).getByText(security.currentPasswordIncorrect, { exact: true }),
        ).toBeVisible();
      });
    });

    guestTest.describe('WHEN the account is deleted from the danger zone', () => {
      guestTest.beforeEach(async ({ page }) => {
        const modal = getSettingsModal(page);
        await modal.getByRole('button', { name: security.deleteAccount, exact: true }).click();
        await modal.getByRole('button', { name: security.deleteButton, exact: true }).click();
        await page.waitForURL(/\/login$/);
      });

      guestTest('THEN the credentials stop working', async ({ page }) => {
        await page.getByLabel(COPY.auth.signIn.email).fill(disposable.email);
        await page.getByLabel(COPY.auth.signIn.password).fill(disposable.password);
        await page.getByRole('button', { name: COPY.auth.signIn.submit, exact: true }).click();

        await expect(getErrorToast(page, COPY.common.errors.invalidCredentials)).toBeVisible();
      });
    });
  });
});

test.describe('profile', () => {
  test.describe('GIVEN the settings dialog on its profile section', () => {
    test.beforeEach(async ({ page, workspace }) => {
      await page.goto('/platform');
      await expect(getSidebar(page)).toContainText(workspace.name);
      const modal = await openSettings(page);
      await openSection(modal, sections.profile);
    });

    test.describe('WHEN the display name is changed and saved', () => {
      test.beforeEach(async ({ page }) => {
        const modal = getSettingsModal(page);
        await modal.getByPlaceholder(profile.namePlaceholder).fill('Renamed thinker');
        await modal.getByRole('button', { name: profile.save }).click();
        await expect(modal.getByText(profile.saved, { exact: true })).toBeVisible();
      });

      test('THEN the sidebar greets the new name after a reload', async ({ page }) => {
        await page.reload();

        await expect(getSidebar(page)).toContainText('Renamed thinker');
      });
    });
  });
});
