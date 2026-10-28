import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: true,
    setupFiles: ['./test-setup.ts'],
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    // tone's ESM build uses extensionless imports that Node can't resolve
    server: { deps: { inline: ['tone'] } },
  },
});
