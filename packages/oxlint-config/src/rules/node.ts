import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['node'],
  rules: {
    'node/no-process-env': ['off'],
    'node/no-top-level-await': ['off'],
  },
});
