import { defineConfig } from 'vitest/config';

// Unit tests for the pure logic in packages/core (config resolution, charset
// registry, animation state helpers). No DOM: MatrixRain itself and the React
// wrapper are not covered here.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/*/src/**/*.test.ts'],
  },
});
