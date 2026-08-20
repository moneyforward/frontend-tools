import { defineConfig, type OxlintConfig } from 'oxlint';
import jestDomRuleSet from '../../../rules/jest-dom.ts';
import testingLibraryReactRuleSet from '../../../rules/testing-library-react.ts';

const config: OxlintConfig = defineConfig({
  extends: [jestDomRuleSet, testingLibraryReactRuleSet],
});

// oxlint-disable-next-line import/no-default-export
export default config;
