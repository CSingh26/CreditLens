import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }, baseURL: 'http://127.0.0.1:3103', screenshot: 'only-on-failure' },
  webServer: [
    { command: '../../.venv/bin/python -m uvicorn app.main:app --app-dir ../../services/api --port 8103', url: 'http://127.0.0.1:8103/healthz', env: { CREDITLENS_ARTIFACTS_DIR: '../../.test-artifacts-empty', DATABASE_URL: 'sqlite://', CORS_ORIGINS: 'http://127.0.0.1:3103' } },
    { command: 'pnpm dev --port 3103', url: 'http://127.0.0.1:3103', env: { NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:8103' }, timeout: 120000 },
  ],
});
