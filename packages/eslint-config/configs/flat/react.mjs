// @ts-check
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11yRuleSetBase from '../../rules/jsx-a11y.js';
import reactHooksRuleSetBase from '../../rules/react-hooks.js';
import reactRuleSetBase from '../../rules/react.js';

const reactRuleSet = {
  plugins: {
    react,
  },
  rules: {
    ...react.configs.recommended.rules,
    ...reactRuleSetBase.rules,
  },
};

const reactHooksRuleSet = {
  plugins: {
    'react-hooks': reactHooks,
  },
  rules: {
    ...reactHooks.configs.flat.recommended.rules,
    ...reactHooksRuleSetBase.rules,
  },
};

const jsxA11yRuleSet = {
  plugins: {
    'jsx-a11y': jsxA11y,
  },
  rules: {
    ...jsxA11y.configs.recommended.rules,
    ...jsxA11yRuleSetBase.rules,
  },
};

export default [
  {
    languageOptions: {
      ...react.configs.flat?.recommended.languageOptions,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  reactRuleSet,
  reactHooksRuleSet,
  jsxA11yRuleSet,
];
