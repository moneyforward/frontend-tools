import { defineConfig } from 'oxlint';
import jsdocRuleSet from '../../rules/jsdoc.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: [jsdocRuleSet],
});
