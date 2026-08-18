// @ts-check
import jsdoc from 'eslint-plugin-jsdoc';
import jsdocRuleSetBase from '../../rules/jsdoc.js';

const jsdocRuleSetTs = {
  plugins: {
    jsdoc,
  },
  rules: {
    ...jsdoc.configs['flat/recommended-typescript-error'].rules,
    ...jsdocRuleSetBase.rules,
  },
};

const jsdocRuleSetJs = {
  plugins: {
    jsdoc,
  },
  rules: {
    ...jsdocRuleSetBase.overrides[0].rules,
  },
};

export default [
  jsdocRuleSetTs,

  {
    files: ['*.@(js|cjs|mjs)'],
    ...jsdocRuleSetJs,
  },
];
