import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.GITHUB_ACTIONS;
const port = 3000;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results/e2e',
  globalSetup: './tests/e2e/globalSetup.ts',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 2 : 4,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report/e2e' }]],
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    locale: 'en-US',
    timezoneId: 'UTC',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    contextOptions: { reducedMotion: 'reduce' },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: isCi ? `pnpm start --port ${port}` : `pnpm dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCi,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
