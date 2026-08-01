import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { test as base } from '@playwright/test';

import { E2E_AUTH_STATE_DIR } from './consts';
import type { IE2ETestFixtures, IE2EWorkerFixtures } from './interfaces';
import {
  deleteAccount,
  deleteOwnedWorkspaces,
  deletePreferences,
  seedAccount,
  seedWorkspace,
  signIn,
  uniqueLabel,
} from './utils';

export const guestTest = base.extend<IE2ETestFixtures, IE2EWorkerFixtures>({
  account: [
    async ({ browser }, use, workerInfo) => {
      const label = uniqueLabel(`w${workerInfo.workerIndex}`);
      const created = await seedAccount(label);
      const storageStatePath = join(E2E_AUTH_STATE_DIR, `${label}.json`);

      mkdirSync(E2E_AUTH_STATE_DIR, { recursive: true });

      const context = await browser.newContext({ baseURL: workerInfo.project.use.baseURL });
      const page = await context.newPage();
      await signIn(page, created.email, created.password);
      await context.storageState({ path: storageStatePath });
      await context.close();

      await use({ ...created, storageStatePath });

      await deleteAccount(created.id);
    },
    { scope: 'worker' },
  ],

  workspace: async ({ account }, use, testInfo) => {
    const workspace = await seedWorkspace(account.id, `Workspace ${testInfo.workerIndex}`);

    await use(workspace);

    await deleteOwnedWorkspaces(account.id);
    await deletePreferences(account.id);
  },
});

export const test = guestTest.extend({
  storageState: ({ account }, use) => use(account.storageStatePath),
});

export { expect } from '@playwright/test';
