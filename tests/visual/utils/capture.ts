import { expect, type Page } from '@playwright/test';

import type { TVisualCaptureConfig } from '../interfaces';
import { getRegionClip } from './geometry';

export const expectVisualScreenshot = async (
  page: Page,
  screenshotName: string,
  capture: TVisualCaptureConfig,
): Promise<void> => {
  if (capture.mode === 'viewport') {
    await expect(page).toHaveScreenshot(screenshotName);

    return;
  }

  if (capture.mode === 'full-page') {
    await expect(page).toHaveScreenshot(screenshotName, { fullPage: true });

    return;
  }

  if (capture.mode === 'element') {
    await expect(page.locator(capture.selector)).toHaveScreenshot(screenshotName);

    return;
  }

  const clip = await getRegionClip(page, capture);

  await expect(page).toHaveScreenshot(screenshotName, { clip });
};
