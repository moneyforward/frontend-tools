import { defineConfig } from 'oxlint';
import eslintRuleSet from '../../rules/eslint.ts';
import importRuleSet from '../../rules/import.ts';
import promiseRuleSet from '../../rules/promise.ts';
import unicornRuleSet from '../../rules/unicorn.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  categories: {
    correctness: 'error',
    nursery: 'error',
    pedantic: 'error',
    perf: 'error',
    restriction: 'error',
    style: 'error',
    suspicious: 'error',
  },
  env: {
    builtin: true,
  },
  extends: [eslintRuleSet, importRuleSet, promiseRuleSet, unicornRuleSet],
  ignorePatterns: ['**/bin/*', '**/build/*', '**/dist/*', '**/node_modules/*'],
});
