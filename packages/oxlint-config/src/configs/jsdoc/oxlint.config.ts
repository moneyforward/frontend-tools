import { defineConfig } from 'oxlint';
import essentials from '../essentials/index.ts';
import jsdoc from './index.ts';

export default defineConfig({
  extends: [essentials, jsdoc],
});
