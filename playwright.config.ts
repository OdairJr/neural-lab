import { defineConfig, devices } from '@playwright/test';

// E2E runs against the Angular production browser output.
// The build output directory is dist/neural-lab/browser (see angular.json).
// Run `npm run build` before `npm run e2e` locally; CI builds first as well.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // Task 1.1.8: trace on retry in CI (where retries happen), retain-on-failure
    // locally (retries are disabled, so this keeps the trace of the first failure).
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Task 9.1.4: record a video for every run so UI review is possible without
    // running the project. Playwright writes them under the output directory
    // (`test-results/<test>/video.webm`).
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs dist/neural-lab/browser 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
});