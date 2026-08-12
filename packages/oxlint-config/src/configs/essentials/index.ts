import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'error',
    pedantic: 'error',
    perf: 'error',
    restriction: 'error',
    style: 'error',
    suspicious: 'error',
  },
  env: {
    builtin: true,
  },
  extends: [],
  ignorePatterns: ['**/bin/*', '**/build/*', '**/dist/*', '**/node_modules/*'],
});
