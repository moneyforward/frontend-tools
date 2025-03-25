export default {
  rules: {
    // https://stylelint.io/user-guide/rules/function-no-unknown/
    'function-no-unknown': [
      true,
      {
        // cf. https://github.com/css-modules/css-modules/blob/master/docs/composition.md#exceptions
        ignoreFunctions: ['global'],
      },
    ],

    // https://stylelint.io/user-guide/rules/property-no-unknown/
    'property-no-unknown': [
      true,
      {
        // cf. https://github.com/css-modules/css-modules/blob/master/docs/composition.md
        ignoreProperties: ['composes'],
      },
    ],

    // The default is kebab-case, but change it to camelCase for better compatibility with JSX.
    // https://stylelint.io/user-guide/rules/selector-class-pattern/
    'selector-class-pattern': [
      '^[_a-z]+([A-Z][a-z]*)*$',
      {
        message: 'Expected class selector to be camelCase',
      },
    ],

    // https://stylelint.io/user-guide/rules/selector-pseudo-class-no-unknown/
    'selector-pseudo-class-no-unknown': [
      true,
      {
        // cf. https://github.com/css-modules/css-modules/blob/master/docs/composition.md#exceptions
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
  },
};
