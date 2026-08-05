import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// TODO: set `base` to the GitHub Pages repo path once deploy-pages.yml is wired up.
export default defineConfig({
  resolve: {
    alias: {
      // dev against core's source directly, no build step needed between the two.
      'app-matrix-rain': fileURLToPath(new URL('../packages/core/src/index.ts', import.meta.url)),
    },
  },
});
