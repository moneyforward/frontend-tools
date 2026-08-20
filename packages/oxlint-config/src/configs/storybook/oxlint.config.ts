import { defineConfig, type OxlintConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import storybook from './index.ts';

const config: OxlintConfig = defineConfig({
  extends: [essentials, storybook],
});

export default config;
