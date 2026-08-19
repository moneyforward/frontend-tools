import { defineConfig } from 'oxlint';
import nodeRuleSet from '../../rules/node.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: [nodeRuleSet],
});
