import { defineConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import nextjs from './index.ts';

export default defineConfig({
  extends: [essentials, nextjs],
});
