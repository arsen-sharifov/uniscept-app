import { defineConfig } from '@playwright/test';

const isOfficialVisualContainer = process.platform === 'linux' && process.env.VISUAL_CONTAINER === '1';
const isExplicitNativeRun = process.env.VISUAL_ALLOW_NATIVE === '1';
const snapshotPathTemplate = isExplicitNativeRun
  ? 'test-results/visual/native-screenshots/{arg}{ext}'
  : '{testDir}/__screenshots__/{arg}{ext}';

if (!isOfficialVisualContainer && !isExplicitNativeRun) {
  throw new Error(
    'Visual tests require the official Playwright Linux container. Run `pnpm test:visual`, or set VISUAL_ALLOW_NATIVE=1 for a throwaway native run.',
  );
}

export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results/visual',
  snapshotPathTemplate,
  fullyParallel: true,
  forbidOnly: !!process.env.GITHUB_ACTIONS,
  retries: process.env.GITHUB_ACTIONS ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/visual' }]],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: 'http://127.0.0.1:6106',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec http-server storybook-static --port 6106 --silent',
    url: 'http://127.0.0.1:6106/iframe.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
