import { defineConfig } from 'oxlint';
import essentials from '../../essentials/index.ts';
import testEssentials from './index.ts';

export default defineConfig({
  extends: [essentials, testEssentials],
});
