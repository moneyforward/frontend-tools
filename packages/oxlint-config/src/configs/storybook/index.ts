import { defineConfig, type OxlintConfig } from 'oxlint';
import storybookRuleSet from '../../rules/storybook.ts';

const config: OxlintConfig = defineConfig({
  extends: [storybookRuleSet],
});

// oxlint-disable-next-line import/no-default-export
export default config;
