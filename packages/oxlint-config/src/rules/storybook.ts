import { configs as storybookConfigs } from 'eslint-plugin-storybook';
import { defineConfig, type OxlintConfig } from 'oxlint';

const config: OxlintConfig = defineConfig({
  jsPlugins: ['eslint-plugin-storybook'],
  overrides: [
    {
      files: ['**/*.{stories,story}.*'],
      rules: {
        'import/no-default-export': ['off'],
        ...storybookConfigs['flat/recommended'].reduce(
          (acc, { rules }) => ({
            ...acc,
            ...rules,
          }),
          {},
        ),
        ...storybookConfigs['flat/csf-strict'].reduce(
          (acc, { rules }) => ({
            ...acc,
            ...rules,
          }),
          {},
        ),
        // Turn off this rule because type definitions such as `Meta` and `StoryObj` need to be imported from `@storybook/react`.
        // https://github.com/storybookjs/storybook/blob/next/code/lib/eslint-plugin/docs/rules/no-renderer-packages.md
        'storybook/no-renderer-packages': ['off'],
        'storybook/no-uninstalled-addons': ['off'],
      },
    },
    {
      files: ['**/.storybook/**/*.*'],
      rules: {
        'import/no-default-export': ['off'],
        'storybook/no-uninstalled-addons': ['error'],
      },
    },
  ],
});

export default config;
