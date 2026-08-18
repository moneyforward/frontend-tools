import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['jsdoc'],
  rules: {
    'jsdoc/check-tag-names': [
      'error',
      {
        definedTags: ['remarks', 'typeParam'],
      },
    ],
    'jsdoc/no-blank-blocks': ['off'],
    'jsdoc/require-param': [
      'error',
      {
        checkConstructors: true,
        checkDestructuredRoots: false,
        checkGetters: false,
      },
    ],
    'jsdoc/require-param-type': ['off'],
    'jsdoc/require-property-type': ['off'],
    'jsdoc/require-returns': ['off'],
    'jsdoc/require-returns-type': ['off'],
    'jsdoc/require-throws-description': ['off'],
    'jsdoc/require-yields-description': ['off'],
  },
  settings: {
    jsdoc: {
      tagNamePreference: {
        remarks: 'remarks',
        typeParam: 'typeParam',
      },
    },
  },

  overrides: [
    {
      // for JavaScript
      files: ['**/*.{js,cjs,mjs}'],
      rules: {
        'jsdoc/require-param-type': ['error'],
        'jsdoc/require-returns': ['error'],
        'jsdoc/require-returns-type': ['error'],
      },
    },
  ],
});
