import type { Locator, Page } from '@playwright/test';

import { COPY } from '../consts';

const getToaster = (page: Page): Locator => page.getByRole('region', { name: COPY.common.notifications });

export const getErrorToast = (page: Page, text: string): Locator =>
  getToaster(page).getByRole('alert').filter({ hasText: text });

export const getStatusToast = (page: Page, text: string): Locator =>
  getToaster(page).getByRole('status').filter({ hasText: text });
