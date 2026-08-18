// @ts-check
import globals from 'globals';
// @ts-ignore
import importPlugin from 'eslint-plugin-import';
import promisePlugin from 'eslint-plugin-promise';
import unicornPlugin from 'eslint-plugin-unicorn';
import bestPracticesRuleSet from '../../rules/best-practices.js';
import errorsRuleSet from '../../rules/errors.js';
import es6RuleSet from '../../rules/es6.js';
import importRuleSetBase from '../../rules/imports.js';
import promiseRuleSetBase from '../../rules/promise.js';
import styleRuleSet from '../../rules/style.js';
import unicornRuleSetBase from '../../rules/unicorn.js';
import variablesRuleSet from '../../rules/variables.js';

const importRuleSet = {
  plugins: {
    import: importPlugin,
  },
  settings: importRuleSetBase.settings,
  rules: {
    ...importPlugin.configs.recommended.rules,
    ...importPlugin.configs.errors.rules,
    ...importRuleSetBase.rules,
  },
};

const promiseRuleSet = {
  plugins: {
    promise: promisePlugin,
  },
  rules: {
    ...promisePlugin.configs.recommended.rules,
    ...promiseRuleSetBase.rules,
  },
};

const unicornRuleSet = {
  plugins: {
    unicorn: unicornPlugin,
  },
  rules: {
    ...unicornPlugin.configs['flat/recommended'].rules,
    ...unicornRuleSetBase.rules,
  },
};

const unicornRuleSetForReact = {
  plugins: {
    unicorn: unicornPlugin,
  },
  rules: {
    ...unicornRuleSetBase.overrides[0].rules,
  },
};

export default [
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: globals.builtin,
    },
  },

  bestPracticesRuleSet,
  errorsRuleSet,
  es6RuleSet,
  importRuleSet,
  promiseRuleSet,
  styleRuleSet,
  variablesRuleSet,

  unicornRuleSet,
  {
    files: ['**/*.{jsx,tsx}'],
    ...unicornRuleSetForReact,
  },
];
