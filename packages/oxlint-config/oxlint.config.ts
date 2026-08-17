import { defineConfig } from 'oxlint';
import essentials from './src/configs/essentials/index.ts';
import typescript from './src/configs/typescript/index.ts';

export default defineConfig({
  extends: [essentials, typescript],
  overrides: [
    {
      files: ['./src/**/*/*.ts'],
      rules: {
        'import/no-default-export': ['off'],
        'unicorn/filename-case': ['off'],
      },
    },
    {
      files: ['*.js'],
      rules: {
        'no-restricted-exports': ['off'],
        'oxc/no-async-await': ['off'],
        'oxc/no-rest-spread-properties': ['off'],
      },
    },
  ],
});
