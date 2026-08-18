import { defineConfig } from 'oxlint';

export default defineConfig({
  overrides: [
    {
      files: ['**/*.{ts,tsx,cts,mts}'],
      plugins: ['typescript'],
      rules: {
        // The following rules are disabled because they are conflicting with the typescript plugin's similar rules.
        // The typescript plugin's rules are more accurate and should be used instead.
        'no-implied-eval': ['off'],
        'no-throw-literal': ['off'],
        'prefer-promise-reject-errors': ['off'],

        'typescript/ban-ts-comment': [
          'error',
          {
            minimumDescriptionLength: 10,
          },
        ],
        'typescript/consistent-return': ['off'],
        'typescript/consistent-type-definitions': ['error', 'type'],
        'typescript/consistent-type-imports': [
          'error',
          {
            fixStyle: 'inline-type-imports',
          },
        ],
        'typescript/explicit-function-return-type': ['off'],
        'typescript/explicit-member-accessibility': ['off'],
        'typescript/explicit-module-boundary-types': ['off'],
        'typescript/method-signature-style': ['off'],
        'typescript/no-deprecated': ['warn'],
        'typescript/no-explicit-any': ['warn', { ignoreRestArgs: true }],
        'typescript/no-floating-promises': [
          'error',
          {
            ignoreIIFE: true,
          },
        ],
        'typescript/no-import-type-side-effects': ['off'],
        'typescript/no-misused-promises': [
          'error',
          {
            // Strict checks on promises with no return value are excessive. It's extremely rare for this to cause a bug.
            checksVoidReturn: false,
          },
        ],
        'typescript/no-unnecessary-parameter-property-assignment': ['off'],
        'typescript/no-unsafe-argument': ['warn'],
        'typescript/no-unsafe-assignment': ['warn'],
        'typescript/no-unsafe-call': ['warn'],
        'typescript/no-unsafe-member-access': ['warn'],
        'typescript/no-unsafe-type-assertion': ['off'],
        'typescript/non-nullable-type-assertion-style': ['off'],
        'typescript/parameter-properties': ['off'],
        'typescript/prefer-promise-reject-errors': [
          'error',
          { allowEmptyReject: true },
        ],
        'typescript/prefer-readonly': ['off'],
        'typescript/prefer-readonly-parameter-types': ['off'],
        'typescript/promise-function-async': ['off'],
        'typescript/restrict-plus-operands': [
          'error',
          {
            allowAny: false,
            allowBoolean: false,
            allowNullish: false,
            allowNumberAndString: false,
            allowRegExp: false,
          },
        ],
        'typescript/restrict-template-expressions': [
          'error',
          {
            allowAny: false,
            allowBoolean: false,
            allowNever: false,
            allowNullish: false,
            allowNumber: false,
            allowRegExp: false,
          },
        ],
        'typescript/return-await': ['error', 'error-handling-correctness-only'],
        'typescript/strict-boolean-expressions': ['warn'],
        'typescript/strict-void-return': ['off'],
      },
    },
    {
      // for JavaScript
      // The `typescript` plugin enabled in the override above is loaded
      // globally by oxlint, so `essentials`' top-level `categories` activate
      // type-aware rules on every file — including `.js`. The rules below are
      // unsatisfiable in untyped JavaScript: the `no-unsafe-*` family and
      // `strict-boolean-expressions` fire purely because a value is `any`, and
      // `prefer-readonly-parameter-types` asks for `readonly` annotations that
      // JavaScript has no syntax for. None of these can be resolved without
      // JSDoc type annotations, so they are disabled for JS. Type-aware rules
      // that idiomatic JS can satisfy (e.g. restrict-plus-operands,
      // restrict-template-expressions) are intentionally left on.
      files: ['**/*.{js,cjs,mjs,jsx}'],
      rules: {
        'typescript/no-unsafe-argument': ['off'],
        'typescript/no-unsafe-assignment': ['off'],
        'typescript/no-unsafe-call': ['off'],
        'typescript/no-unsafe-member-access': ['off'],
        'typescript/no-unsafe-return': ['off'],
        'typescript/no-unsafe-unary-minus': ['off'],
        'typescript/prefer-readonly-parameter-types': ['off'],
        'typescript/strict-boolean-expressions': ['off'],
      },
    },
  ],
});
