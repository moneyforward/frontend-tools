import { defineConfig } from 'oxlint';
import typescriptRuleSet from '../../rules/typescript.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
  },
  extends: [typescriptRuleSet],
});
