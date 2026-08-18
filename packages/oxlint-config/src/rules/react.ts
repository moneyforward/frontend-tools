import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['react'],
  rules: {
    'react/button-has-type': ['off'],
    'react/checked-requires-onchange-or-readonly': ['off'],
    'react/display-name': ['off'],
    'react/forbid-component-props': ['off'],
    'react/forbid-dom-props': ['off'],
    'react/forbid-elements': ['off'],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.jsx', '.tsx'],
      },
    ],
    'react/jsx-max-depth': ['off'],
    'react/jsx-no-literals': ['off'],
    'react/jsx-no-script-url': [
      'error',
      [
        {
          name: 'Link',
          props: ['to'],
        },
      ],
    ],
    'react/jsx-pascal-case': [
      'error',
      {
        allowAllCaps: true,
      },
    ],
    'react/jsx-props-no-spreading': [
      2,
      {
        explicitSpread: 'ignore',
      },
    ],
    'react/no-array-index-key': ['off'],
    'react/no-danger': ['warn'],
    'react/no-did-mount-set-state': ['off'],
    'react/no-multi-comp': ['off'],
    'react/no-object-type-as-default-prop': ['off'],
    'react/no-redundant-should-component-update': ['off'],
    'react/no-unsafe': ['off'],
    'react/only-export-components': ['warn'],
    'react/react-in-jsx-scope': ['off'],
  },
});
