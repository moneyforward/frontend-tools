module.exports = {
  plugins: ['react-hooks'],
  extends: ['plugin:react-hooks/recommended'],

  rules: {
    // Verify the list of the dependencies for Hooks like useEffect and similar.
    // https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/src/ExhaustiveDeps.js
    'react-hooks/exhaustive-deps': ['error'],

    // Enforce Rules of Hooks.
    // https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/src/RulesOfHooks.js
    'react-hooks/rules-of-hooks': ['error'],
  },
};
