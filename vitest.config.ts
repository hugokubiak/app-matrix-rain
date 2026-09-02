import { defineConfig } from 'vitest/config';

// Unit tests for packages/core (pure logic + the MatrixRain class) and
// packages/react (the wrapper). Default env is node; DOM-dependent files opt in
// with a `// @vitest-environment jsdom` docblock.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
  },
});
