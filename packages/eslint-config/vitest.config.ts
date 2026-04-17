import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    globals: true,
    include: ['test/**/*.test.mts'],
    testTimeout: 30_000,
  },
});
