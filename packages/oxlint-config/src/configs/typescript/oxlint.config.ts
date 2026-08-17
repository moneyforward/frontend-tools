import { defineConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import typescript from './index.ts';

export default defineConfig({
  extends: [essentials, typescript],
});
