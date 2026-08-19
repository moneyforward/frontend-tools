import jestDom from 'eslint-plugin-jest-dom';
import { defineConfig, type OxlintConfig } from 'oxlint';

const config: OxlintConfig = defineConfig({
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
      jsPlugins: ['eslint-plugin-jest-dom'],
      rules: {
        ...jestDom.configs.recommended.rules,
      },
    },
  ],
});

export default config;
