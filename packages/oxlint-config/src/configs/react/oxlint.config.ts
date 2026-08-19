import { defineConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import react from './index.ts';

export default defineConfig({
  extends: [essentials, react],
});
