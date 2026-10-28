import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: true,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
