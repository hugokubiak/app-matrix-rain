import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests for packages/core (pure logic + the MatrixRain class) and
// packages/react (the wrapper). Default env is node; DOM-dependent files opt in
// with a `// @vitest-environment jsdom` docblock.
export default defineConfig({
  resolve: {
    alias: {
      // Resolve the workspace package to core's source so tests do not depend on
      // a prior build. The react wrapper mocks this module anyway.
      'app-matrix-rain': fileURLToPath(new URL('./packages/core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
  },
});
