import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Local shop API for the API tests (started automatically)
  webServer: {
    command: 'node mock/shop-server.js',
    url: 'http://localhost:4100/health',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      use: { baseURL: 'http://localhost:4100' },
    },
    { name: 'chromium', testIgnore: /tests\/api\//, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: /tests\/api\//, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: /tests\/api\//, use: { ...devices['Desktop Safari'] } },
  ],
});
