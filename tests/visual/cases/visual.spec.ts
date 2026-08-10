import { test } from '@playwright/test';

import { VISUAL_CONFIG } from '../consts';
import { blockExternalRequests, expectVisualScreenshot, waitForStoryReady } from '../utils';

const { captures, cases, themes } = VISUAL_CONFIG;

cases.forEach(({ name, storyId, capture, urlArgs }) => {
  test.describe(name, () => {
    test.describe(`GIVEN the ${storyId} story`, () => {
      test.beforeEach(async ({ page }) => {
        await blockExternalRequests(page);
      });

      themes.forEach((theme) => {
        test.describe(`WHEN rendered with the ${theme} theme`, () => {
          test.beforeEach(async ({ page }) => {
            await page.goto(
              `/iframe.html?id=${storyId}&viewMode=story&globals=theme:${theme}${urlArgs ? `&args=${urlArgs}` : ''}`,
            );
            await waitForStoryReady(page, theme);
          });

          test('THEN it matches the visual baseline', async ({ page }) => {
            await expectVisualScreenshot(page, `${name}--${theme}.png`, captures[capture]);
          });
        });
      });
    });
  });
});
