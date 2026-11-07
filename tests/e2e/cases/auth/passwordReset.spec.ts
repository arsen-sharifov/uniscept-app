import type { BrowserContext, Page } from '@playwright/test';

import { COPY, E2E_ACCOUNT_DOMAIN, NEW_PASSWORD, RESET_EMAIL_SUBJECT_UK } from '../../consts';
import { expect, guestTest, test } from '../../fixtures';
import type { IE2ESeededAccount } from '../../interfaces';
import {
  assignClientAddress,
  deleteAccount,
  getErrorToast,
  getSidebar,
  openSection,
  openSettings,
  readEmailSubject,
  readResetLink,
  seedAccount,
  seedLanguage,
  signIn,
  signOut,
  uniqueLabel,
} from '../../utils';

guestTest.describe('password reset', () => {
  guestTest.describe('GIVEN a person who asked for a reset link from the sign-in page', () => {
    let account: IE2ESeededAccount;

    guestTest.beforeEach(async ({ page }) => {
      account = await seedAccount(uniqueLabel('forgot'));
      await assignClientAddress(page);
      await page.goto('/login');
      await page.getByRole('link', { name: COPY.auth.signIn.forgotPassword }).click();
      await page.waitForURL(/\/forgot-password$/);
      await page.getByLabel(COPY.auth.forgotPassword.email).fill(account.email);
      await page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click();
    });

    guestTest.afterEach(async () => {
      await deleteAccount(account.id);
    });

    guestTest.describe('WHEN the answer arrives', () => {
      guestTest('THEN they are told that a link is on its way', async ({ page }) => {
        await expect(
          page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', account.email) }),
        ).toBeVisible();
      });

      guestTest('THEN sending again waits for the pause between links', async ({ page }) => {
        await expect(
          page.getByRole('button', {
            name: new RegExp(COPY.auth.forgotPassword.resendIn.replace('{seconds, number}', String.raw`\d+`)),
          }),
        ).toBeDisabled();
      });
    });

    guestTest.describe('WHEN they follow the emailed link and save a new password', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.goto(await readResetLink(account.email));
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
        await page.waitForURL(/\/platform/);
      });

      guestTest('THEN they land signed in on the platform', async ({ page }) => {
        await expect(getSidebar(page)).toBeVisible();
      });
    });

    guestTest.describe('WHEN they save a new password, sign out and sign in with it', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.goto(await readResetLink(account.email));
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
        await page.waitForURL(/\/platform/);
        await signOut(page);
        await signIn(page, account.email, NEW_PASSWORD);
      });

      guestTest('THEN the platform opens for the new credentials', async ({ page }) => {
        await expect(getSidebar(page)).toBeVisible();
      });
    });

    guestTest.describe('WHEN they save a new password, sign out and try the old one', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.goto(await readResetLink(account.email));
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
        await page.waitForURL(/\/platform/);
        await signOut(page);
        await page.getByLabel(COPY.auth.signIn.email).fill(account.email);
        await page.getByLabel(COPY.auth.signIn.password).fill(account.password);
        await page.getByRole('button', { name: COPY.auth.signIn.submit, exact: true }).click();
      });

      guestTest('THEN the old password is refused', async ({ page }) => {
        await expect(getErrorToast(page, COPY.common.errors.invalidCredentials)).toBeVisible();
        await expect(page).toHaveURL(/\/login$/);
      });
    });

    guestTest.describe('WHEN they use the link a second time after saving a new password', () => {
      guestTest.beforeEach(async ({ page }) => {
        const resetLink = await readResetLink(account.email);
        await page.goto(resetLink);
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
        await page.waitForURL(/\/platform/);
        await page.goto(resetLink);
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(account.password);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(account.password);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
      });

      guestTest('THEN the link is refused with a way to request a new one', async ({ page }) => {
        await expect(page.getByRole('alert').filter({ hasText: COPY.auth.resetPassword.rejected })).toBeVisible();
        await expect(page.getByRole('link', { name: COPY.auth.resetPassword.requestNew })).toHaveAttribute(
          'href',
          '/forgot-password',
        );
      });
    });
  });

  guestTest.describe('GIVEN an account also signed in on another device, whose owner asked for a reset link', () => {
    let account: IE2ESeededAccount;
    let otherContext: BrowserContext;
    let otherPage: Page;

    guestTest.beforeEach(async ({ browser, baseURL, page }) => {
      account = await seedAccount(uniqueLabel('devices'));
      otherContext = await browser.newContext({ baseURL });
      otherPage = await otherContext.newPage();
      await signIn(otherPage, account.email, account.password);
      await assignClientAddress(page);
      await page.goto('/forgot-password');
      await page.getByLabel(COPY.auth.forgotPassword.email).fill(account.email);
      await page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click();
      await expect(page.getByRole('button', { name: COPY.auth.forgotPassword.resend })).toBeVisible();
    });

    guestTest.afterEach(async () => {
      await otherContext.close();
      await deleteAccount(account.id);
    });

    guestTest.describe('WHEN a new password is saved and the other device opens the platform again', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.goto(await readResetLink(account.email));
        await page.getByLabel(COPY.auth.resetPassword.password, { exact: true }).fill(NEW_PASSWORD);
        await page.getByLabel(COPY.auth.resetPassword.confirmPassword, { exact: true }).fill(NEW_PASSWORD);
        await page.getByRole('button', { name: COPY.auth.resetPassword.submit, exact: true }).click();
        await page.waitForURL(/\/platform/);
        await otherPage.goto('/platform');
      });

      guestTest('THEN the other device is signed out while this one stays in', async ({ page }) => {
        await expect(otherPage).toHaveURL(/\/login$/);
        await expect(getSidebar(page)).toBeVisible();
      });
    });
  });

  guestTest.describe('GIVEN a person who asked for a link and is waiting to send it again', () => {
    let email: string;

    guestTest.beforeEach(async ({ page }) => {
      email = `${uniqueLabel('paused')}@${E2E_ACCOUNT_DOMAIN}`;
      await assignClientAddress(page);
      await page.goto('/forgot-password');
      await page.getByLabel(COPY.auth.forgotPassword.email).fill(email);
      await page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click();
      await expect(
        page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
      ).toBeVisible();
    });

    guestTest.describe('WHEN the page is reloaded', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.reload();
      });

      guestTest('THEN the notice and the paused button stay', async ({ page }) => {
        await expect(
          page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', {
            name: new RegExp(COPY.auth.forgotPassword.resendIn.replace('{seconds, number}', String.raw`\d+`)),
          }),
        ).toBeDisabled();
      });
    });

    guestTest.describe('WHEN they go back to sign in and return through the browser history', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.getByRole('link', { name: COPY.auth.forgotPassword.backToSignIn }).click();
        await page.waitForURL(/\/login$/);
        await page.goBack();
        await page.waitForURL(/\/forgot-password$/);
      });

      guestTest('THEN the notice and the paused button stay', async ({ page }) => {
        await expect(
          page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', {
            name: new RegExp(COPY.auth.forgotPassword.resendIn.replace('{seconds, number}', String.raw`\d+`)),
          }),
        ).toBeDisabled();
      });
    });

    guestTest.describe('WHEN they go back to sign in and follow the forgotten password link again', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.getByRole('link', { name: COPY.auth.forgotPassword.backToSignIn }).click();
        await page.waitForURL(/\/login$/);
        await page.getByRole('link', { name: COPY.auth.signIn.forgotPassword }).click();
        await page.waitForURL(/\/forgot-password$/);
      });

      guestTest('THEN the notice and the paused button stay', async ({ page }) => {
        await expect(
          page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
        ).toBeVisible();
        await expect(
          page.getByRole('button', {
            name: new RegExp(COPY.auth.forgotPassword.resendIn.replace('{seconds, number}', String.raw`\d+`)),
          }),
        ).toBeDisabled();
      });
    });
  });

  guestTest.describe('GIVEN a person who typed the email on the sign-in page', () => {
    let email: string;

    guestTest.beforeEach(async ({ page }) => {
      email = `${uniqueLabel('typed')}@${E2E_ACCOUNT_DOMAIN}`;
      await page.goto('/login');
      await page.getByLabel(COPY.auth.signIn.email).fill(email);
    });

    guestTest.describe('WHEN they follow the forgotten password link', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.getByRole('link', { name: COPY.auth.signIn.forgotPassword }).click();
        await page.waitForURL(/\/forgot-password$/);
      });

      guestTest('THEN the email is already filled in', async ({ page }) => {
        await expect(page.getByLabel(COPY.auth.forgotPassword.email)).toHaveValue(email);
      });
    });
  });

  guestTest.describe('GIVEN an email that no account uses', () => {
    let email: string;
    let clientAddress: string;

    guestTest.beforeEach(async ({ page }) => {
      email = `${uniqueLabel('nobody')}@${E2E_ACCOUNT_DOMAIN}`;
      clientAddress = await assignClientAddress(page);
      await page.goto('/forgot-password');
    });

    guestTest.describe('WHEN a reset link is asked for it', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.getByLabel(COPY.auth.forgotPassword.email).fill(email);
        await page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click();
      });

      guestTest('THEN the answer is the same as for an existing account', async ({ page }) => {
        await expect(
          page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
        ).toBeVisible();
      });
    });

    guestTest.describe('WHEN a link was asked for it elsewhere less than a minute ago and the form asks again', () => {
      let refusedStatus: number;

      guestTest.beforeEach(async ({ page }) => {
        await page.request.post('/auth/password-reset', {
          data: { email },
          headers: { 'x-forwarded-for': clientAddress },
        });
        await page.getByLabel(COPY.auth.forgotPassword.email).fill(email);
        const [refused] = await Promise.all([
          page.waitForResponse((response) => response.url().endsWith('/auth/password-reset')),
          page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click(),
        ]);
        refusedStatus = refused.status();
      });

      guestTest(
        'THEN the server refuses it while the page shows the same notice and a paused button',
        async ({ page }) => {
          expect(refusedStatus).toBe(429);
          await expect(
            page.getByRole('status').filter({ hasText: COPY.auth.forgotPassword.sent.replace('{email}', email) }),
          ).toBeVisible();
          await expect(
            page.getByRole('button', {
              name: new RegExp(COPY.auth.forgotPassword.resendIn.replace('{seconds, number}', String.raw`\d+`)),
            }),
          ).toBeDisabled();
          await expect(getErrorToast(page, COPY.common.errors.rateLimit)).toHaveCount(0);
        },
      );
    });
  });

  guestTest.describe('GIVEN an account that uses the interface in Ukrainian', () => {
    let account: IE2ESeededAccount;

    guestTest.beforeEach(async ({ page }) => {
      account = await seedAccount(uniqueLabel('ukrainian'));
      await seedLanguage(account.id, 'uk');
      await assignClientAddress(page);
      await page.goto('/forgot-password');
    });

    guestTest.afterEach(async () => {
      await deleteAccount(account.id);
    });

    guestTest.describe('WHEN a reset link is asked for from an English page', () => {
      guestTest.beforeEach(async ({ page }) => {
        await page.getByLabel(COPY.auth.forgotPassword.email).fill(account.email);
        await page.getByRole('button', { name: COPY.auth.forgotPassword.submit, exact: true }).click();
      });

      guestTest('THEN the email speaks the language of the account', async () => {
        await expect(readEmailSubject(account.email)).resolves.toBe(RESET_EMAIL_SUBJECT_UK);
      });
    });
  });
});

test.describe('password reset from the settings', () => {
  test.describe('GIVEN a signed-in person on the security section', () => {
    test.beforeEach(async ({ page }) => {
      await assignClientAddress(page);
      await page.goto('/platform');
      const modal = await openSettings(page);
      await openSection(modal, COPY.platform.settings.sections.security);
    });

    test.describe('WHEN they ask for a reset link because they forgot the current password', () => {
      test.beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: COPY.platform.settings.security.sendResetLink }).click();
      });

      test('THEN they are told where the link went and it reaches their inbox', async ({ page, account }) => {
        await expect(
          page.getByText(COPY.platform.settings.security.resetLinkSent.replace('{email}', account.email)),
        ).toBeVisible();
        await expect(readResetLink(account.email)).resolves.toContain('/reset-password?token_hash=');
      });
    });
  });
});
