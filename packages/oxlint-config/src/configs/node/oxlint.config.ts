import { defineConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import node from './index.ts';

export default defineConfig({
  extends: [essentials, node],
});
