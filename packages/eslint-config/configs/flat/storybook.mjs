// @ts-check
// @ts-ignore
import importPlugin from 'eslint-plugin-import';
import storybook from 'eslint-plugin-storybook';

export default [
  {
    plugins: {
      storybook,
      import: importPlugin,
    },
  },

  ...storybook.configs['flat/recommended'],
  ...storybook.configs['flat/csf-strict'],

  {
    files: [
      '**/*.@(stories|story).@(ts|tsx|js|jsx|mjs|cjs)',
      '**/.storybook/**/*.@(ts|tsx|js|jsx)',
    ],
    rules: {
      'import/no-default-export': ['off'],

      // Turn off this rule because type definitions such as `Meta` and `StoryObj` need to be imported from `@storybook/react`.
      // https://github.com/storybookjs/storybook/blob/next/code/lib/eslint-plugin/docs/rules/no-renderer-packages.md
      'storybook/no-renderer-packages': ['off'],
    },
  },
];
