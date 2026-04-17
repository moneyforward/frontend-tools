// @ts-check
import jest from 'eslint-plugin-jest';
import { essentials, node } from './configs/flat/index.mjs';
import jestRuleSetBase from './rules/jest.js';

export default [
  ...essentials,

  ...node,

  {
    files: [
      '**/eslintrc/**/*',
      'rules/**/*',
      'test/**/*',
      '**/snapshot.test.*',
      '.prettierrc.js',
      'release.config.js',
    ],
    rules: {
      'unicorn/prefer-module': ['off'],
      'unicorn/filename-case': ['off'],
    },
  },

  {
    files: ['**/flat/**/*.mjs', '**/*.config.*'],
    rules: {
      'import/no-default-export': ['off'],
    },
  },

  {
    files: ['**/*.test.*'],
    plugins: {
      jest,
    },
    rules: {
      ...jest.configs.recommended.rules,
      ...jest.configs.style.rules,
      ...jestRuleSetBase.rules,
    },
  },
];
