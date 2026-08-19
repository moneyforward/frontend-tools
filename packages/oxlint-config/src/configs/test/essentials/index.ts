import { defineConfig } from 'oxlint';
import vitestRuleSet from '../../../rules/vitest.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: [vitestRuleSet],
});
