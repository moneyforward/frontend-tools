import { defineConfig } from 'oxlint';
import essentials from '../../essentials/index.ts';
import testEssentials from '../essentials/index.ts';
import testReact from './index.ts';

export default defineConfig({
  extends: [essentials, testEssentials, testReact],
});
