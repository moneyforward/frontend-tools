export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],

  rules: {
    // https://stylelint.io/user-guide/rules/declaration-block-no-redundant-longhand-properties/
    'declaration-block-no-redundant-longhand-properties': [
      true,
      {
        // Exclude `grid-template` to be able to use `grid-template-areas`.
        ignoreShorthands: ['grid-template'],
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
  },
};
