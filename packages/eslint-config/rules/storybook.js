module.exports = {
  plugins: ['storybook'],
  extends: ['plugin:storybook/recommended'],
  rules: {
    // Turn off this rule because type definitions such as `Meta` and `StoryObj` need to be imported from `@storybook/react`.
    // https://github.com/storybookjs/storybook/blob/next/code/lib/eslint-plugin/docs/rules/no-renderer-packages.md
    'storybook/no-renderer-packages': ['off'],

    // `storiesOf` is deprecated and should not be used
    // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-stories-of.md
    // Since Storybook 5.2, the CSF format was introduced and the storiesOf API has been deprecated.
    'storybook/no-stories-of': 'error',

    // Do not define a title in meta
    // https://github.com/storybookjs/eslint-plugin-storybook/blob/main/docs/rules/no-title-property-in-meta.md
    // Starting in CSF 3.0, story titles can be generated automatically.
    'storybook/no-title-property-in-meta': 'error',
  },

  overrides: [
    {
      files: [
        '*.stories.@(ts|tsx|js|jsx)',
        '*.story.@(ts|tsx|js|jsx)',
        '**/.storybook/**/*.@(ts|tsx|js|jsx)',
      ],
      rules: {
        'import/no-default-export': ['off'],
      },
    },
  ],
};
