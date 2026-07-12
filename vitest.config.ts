import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['./tests/setup.ts'],
    mockReset: true,
    coverage: {
      include: ['src/**'],
      exclude: ['src/**/index.ts', 'src/lib/interfaces/**', 'src/lib/supabase/database.types.ts'],
      reporter: ['text-summary', 'html'],
    },
  },
});
