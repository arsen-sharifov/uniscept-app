import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          setupFiles: ['./tests/unit/setup.ts'],
          mockReset: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          globalSetup: ['./tests/integration/globalSetup.ts'],
        },
      },
    ],
    coverage: {
      include: ['src/**'],
      exclude: ['src/**/index.ts', 'src/lib/interfaces/**'],
      reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'artifacts/coverage',
      thresholds: {
        statements: 95,
        branches: 91,
        functions: 95,
        lines: 96,
      },
    },
  },
});
