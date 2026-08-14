import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['import'],
  rules: {
    'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
    'import/default': ['off'],
    'import/exports-last': ['off'],
    'import/extensions': ['off'],
    'import/group-exports': ['off'],
    'import/max-dependencies': ['off'],
    'import/namespace': ['off'],
    'import/no-anonymous-default-export': ['off'],
    'import/no-commonjs': ['off'],
    'import/no-named-export': ['off'],
    'import/no-namespace': ['off'],
    'import/no-nodejs-modules': ['off'],
    'import/no-relative-parent-imports': ['off'],
    'import/no-unassigned-import': ['off'],
    'import/prefer-default-export': ['off'],
    'import/unambiguous': ['off'],
  },

  overrides: [
    {
      files: ['**/*.config.*'],
      rules: {
        'import/no-default-export': ['off'],
      },
    },
  ],
});
