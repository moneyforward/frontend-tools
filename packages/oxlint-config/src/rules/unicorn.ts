import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['unicorn'],
  rules: {
    'unicorn/consistent-function-scoping': ['off'],
    'unicorn/custom-error-definition': ['off'],
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
    'unicorn/new-for-builtins': ['off'],
    'unicorn/no-array-callback-reference': ['off'],
    'unicorn/no-array-for-each': ['off'],
    'unicorn/no-array-reduce': ['off'],
    'unicorn/no-negated-condition': ['off'],
    'unicorn/no-null': ['off'],
    'unicorn/prefer-global-this': ['off'],
    'unicorn/prefer-import-meta-properties': ['off'],
    // 'unicorn/relative-url-style': ['error', 'never'],
    'unicorn/require-post-message-target-origin': ['off'],
  },

  overrides: [
    {
      files: ['**/*.{jsx,tsx}'],
      rules: {
        // Disallow anonymous functions and classes as the default export.
        // This rule conflicts with the `react/function-component-definition` rule.
        'unicorn/no-anonymous-default-export': ['off'],
      },
    },
  ],
});
