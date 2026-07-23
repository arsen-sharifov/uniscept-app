import type { Page } from '@playwright/test';

import type { TTheme } from '@interfaces';

export const blockExternalRequests = async (page: Page) => {
  await page.route(
    (url) => (url.protocol === 'http:' || url.protocol === 'https:') && url.port !== '6106',
    (route) => route.abort(),
  );
};

export const waitForStoryReady = async (page: Page, theme: TTheme) => {
  await page.waitForFunction((expectedTheme) => {
    const root = document.querySelector('#storybook-root');

    return (
      root !== null &&
      root.children.length > 0 &&
      document.documentElement.dataset.theme === expectedTheme &&
      root.querySelector<HTMLElement>('[data-theme]')?.dataset.theme === expectedTheme
    );
  }, theme);

  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
};
