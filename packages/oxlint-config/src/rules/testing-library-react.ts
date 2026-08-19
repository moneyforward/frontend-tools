import testingLibrary from 'eslint-plugin-testing-library';
import { defineConfig, type OxlintConfig } from 'oxlint';

const config: OxlintConfig = defineConfig({
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
      jsPlugins: ['eslint-plugin-testing-library'],
      rules: {
        ...testingLibrary.configs.react.rules,
      },
    },
  ],
});

export default config;
