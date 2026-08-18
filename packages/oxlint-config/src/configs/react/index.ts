import { defineConfig } from 'oxlint';
import jsxA11yRuleSet from '../../rules/jsx-a11y.ts';
import reactRuleSet from '../../rules/react.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: [reactRuleSet, jsxA11yRuleSet],
});
