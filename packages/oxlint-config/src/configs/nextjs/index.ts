import { defineConfig } from 'oxlint';
import nextjsRuleset from '../../rules/nextjs.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  extends: [nextjsRuleset],
});
