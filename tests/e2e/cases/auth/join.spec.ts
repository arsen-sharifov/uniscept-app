import { COPY, E2E_ACCOUNT_DOMAIN, E2E_ACCOUNT_PASSWORD } from '../../consts';
import { expect, guestTest as test } from '../../fixtures';
import {
  deleteAccountByEmail,
  getWorkspaceRow,
  openWorkspacePanel,
  readConfirmationLink,
  seedInvitation,
  sendInviteEmail,
  uniqueLabel,
} from '../../utils';

const { signUp } = COPY.auth;
const { planStep, accountStep } = signUp;

test.describe('workspace join', () => {
  test.describe('GIVEN a teammate invited to a workspace by email', () => {
    let email: string;
    let inviteLink: string;

    test.beforeEach(async ({ workspace }) => {
      email = `${uniqueLabel('joined')}@${E2E_ACCOUNT_DOMAIN}`;
      await seedInvitation(workspace.id, email, 'member');
      await sendInviteEmail(email, workspace.name);
      inviteLink = await readConfirmationLink(email);
    });

    test.afterEach(async () => {
      await deleteAccountByEmail(email);
    });

    test.describe('WHEN the emailed link is followed and the account is completed', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(inviteLink);
        await expect(page).toHaveURL(/\/join/);
        await page.getByRole('button', { name: planStep.continue }).click();
        await expect(page.getByRole('heading', { name: signUp.inviteHeading })).toBeVisible();
        await expect(page.getByLabel(accountStep.email)).toHaveValue(email);
        await page.getByLabel(accountStep.name).fill('Invited Teammate');
        await page.getByLabel(accountStep.password).fill(E2E_ACCOUNT_PASSWORD);
        await page.getByRole('button', { name: accountStep.join, exact: true }).click();
      });

      test('THEN the platform opens with the shared workspace joined', async ({ page, workspace }) => {
        await expect(page).toHaveURL(/\/platform/);

        const panel = await openWorkspacePanel(page);

        await expect(getWorkspaceRow(panel, workspace.name)).toBeVisible();
      });
    });
  });

  test.describe('GIVEN a visitor without an invited session', () => {
    test.describe('WHEN the join page is opened directly', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/join');
      });

      test('THEN the visitor lands on the sign-in page', async ({ page }) => {
        await expect(page).toHaveURL(/\/login/);
      });
    });
  });
});
