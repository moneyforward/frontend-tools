import { essentials, node, typescript } from 'eslint-config-moneyforward/flat';

export default [
  {
    files: ['**/*.js'],
  },

  ...essentials,
  {
    rules: {
      'import/no-default-export': ['off'],
      'unicorn/filename-case': ['off'],
    },
  },
  {
    files: ['**/*.config.@(js|ts)'],
    rules: {
      'no-restricted-exports': ['off'],
      'import/no-extraneous-dependencies': ['off'],
    },
  },

  ...node,

  ...typescript,

  {
    files: ['test/**/*'],
    rules: {
      'n/no-unsupported-features/node-builtins': ['off'],
    },
  },
];
