import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    exclude: [
      'node_modules/**',
      'dist/**',
      'e2e/**',
      'src/content/**',
      'src/templates/**',
    ],
    setupFiles: ['./tests/setup.ts'],
  },
});
