import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Project Pages site is served from https://hugokubiak.github.io/app-matrix-rain/,
// so production assets need that base. Dev/preview stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/app-matrix-rain/' : '/',
  resolve: {
    alias: {
      // dev against core's source directly, no build step needed between the two.
      'app-matrix-rain': fileURLToPath(new URL('../packages/core/src/index.ts', import.meta.url)),
    },
  },
}));
