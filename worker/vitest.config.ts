// What this file is: a minimal, worker-only Vitest config, so testing the
// Worker doesn't inherit the frontend's vite.config.ts (which has React
// plugins the Worker has no use for).
// In plain terms: settings for running the proxy server's own tests,
// completely separate from the app's tests.

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
