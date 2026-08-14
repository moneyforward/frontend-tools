import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['eslint'],

  rules: {
    'accessor-pairs': ['off'],
    'array-callback-return': [
      'error',
      {
        allowImplicit: true,
      },
    ],
    'capitalized-comments': ['off'],
    complexity: ['off'],
    curly: ['error', 'multi-line'],
    'default-case': ['off'],
    'func-name-matching': ['off'],
    'func-style': ['off'],
    'getter-return': [
      'error',
      {
        allowImplicit: true,
      },
    ],
    'id-denylist': ['off'],
    'id-length': ['off'],
    'id-match': ['off'],
    'init-declarations': ['off'],
    'logical-assignment-operators': ['off'],
    'max-depth': ['off'],
    'max-lines': ['off'],
    'max-lines-per-function': ['off'],
    'max-nested-callbacks': ['off'],
    'max-params': ['off'],
    'max-statements': ['off'],
    'new-cap': [
      'error',
      {
        newIsCap: true,
        newIsCapExceptions: [],
        capIsNew: false,
        capIsNewExceptions: [
          'Immutable.Map',
          'Immutable.Set',
          'Immutable.List',
        ],
      },
    ],
    'no-case-declarations': ['warn'],
    'no-console': [
      'warn',
      {
        allow: ['info', 'warn', 'error', 'time', 'timeEnd'],
      },
    ],
    'no-div-regex': ['off'],
    'no-duplicate-imports': ['off'],
    'no-else-return': [
      'error',
      {
        allowElseIf: false,
      },
    ],
    'no-empty-function': [
      'error',
      {
        allow: [
          'arrowFunctions',
          'functions',
          'methods',
          // An empty constructor method must be available in order to use TypeScript's Parameter Properties.
          'constructors',
        ],
      },
    ],
    'no-eq-null': ['off'],
    'no-implicit-coercion': [
      'error',
      {
        boolean: false,
        number: true,
        string: true,
        allow: [],
      },
    ],
    'no-inline-comments': ['off'],
    'no-magic-numbers': ['off'],
    'no-negated-condition': ['off'],
    'no-nested-ternary': ['off'],
    'no-param-reassign': [
      'error',
      {
        props: true,
        ignorePropertyModificationsFor: [
          'acc', // for reduce accumulators
          'accumulator', // for reduce accumulators
          'e', // for e.returnvalue
          'ctx', // for Koa routing
          'context', // for Koa routing
          'req', // for Express requests
          'request', // for Express requests
          'res', // for Express responses
          'response', // for Express responses
          '$scope', // for Angular 1 scopes
          'staticContext', // for ReactRouter context
        ],
      },
    ],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'no-redeclare': ['off'],
    'no-restricted-exports': [
      'error',
      {
        restrictedNamedExports: [
          'default', // use `export default` to provide a default export
          'then', // this will cause tons of confusion when your module is dynamically `import()`ed, and will break in most node ESM versions
        ],
      },
    ],
    'no-restricted-globals': [
      'error',
      {
        message: 'Use Number.isFinite instead.',
        name: 'isFinite',
      },
      {
        message: 'Use Number.isNaN instead.',
        name: 'isNaN',
      },
      {
        message: 'Use window.addEventListener instead.',
        name: 'addEventListener',
      },
      {
        message: 'Use window.blur instead.',
        name: 'blur',
      },
      {
        message: 'Use window.close instead.',
        name: 'close',
      },
      {
        message: 'Use window.closed instead.',
        name: 'closed',
      },
      {
        message: 'Use window.confirm instead.',
        name: 'confirm',
      },
      {
        message: 'Use window.defaultStatus instead.',
        name: 'defaultStatus',
      },
      {
        message: 'Use window.defaultstatus instead.',
        name: 'defaultstatus',
      },
      {
        message: 'Use window.event instead.',
        name: 'event',
      },
      {
        message: 'Use window.external instead.',
        name: 'external',
      },
      {
        message: 'Use window.find instead.',
        name: 'find',
      },
      {
        message: 'Use window.focus instead.',
        name: 'focus',
      },
      {
        message: 'Use window.frameElement instead.',
        name: 'frameElement',
      },
      {
        message: 'Use window.frames instead.',
        name: 'frames',
      },
      {
        message: 'Use window.history instead.',
        name: 'history',
      },
      {
        message: 'Use window.innerHeight instead.',
        name: 'innerHeight',
      },
      {
        message: 'Use window.innerWidth instead.',
        name: 'innerWidth',
      },
      {
        message: 'Use window.length instead.',
        name: 'length',
      },
      {
        message: 'Use window.location instead.',
        name: 'location',
      },
      {
        message: 'Use window.locationbar instead.',
        name: 'locationbar',
      },
      {
        message: 'Use window.menubar instead.',
        name: 'menubar',
      },
      {
        message: 'Use window.moveBy instead.',
        name: 'moveBy',
      },
      {
        message: 'Use window.moveTo instead.',
        name: 'moveTo',
      },
      {
        message: 'Use window.name instead.',
        name: 'name',
      },
      {
        message: 'Use window.onblur instead.',
        name: 'onblur',
      },
      {
        message: 'Use window.onerror instead.',
        name: 'onerror',
      },
      {
        message: 'Use window.onfocus instead.',
        name: 'onfocus',
      },
      {
        message: 'Use window.onload instead.',
        name: 'onload',
      },
      {
        message: 'Use window.onresize instead.',
        name: 'onresize',
      },
      {
        message: 'Use window.onunload instead.',
        name: 'onunload',
      },
      {
        message: 'Use window.open instead.',
        name: 'open',
      },
      {
        message: 'Use window.opener instead.',
        name: 'opener',
      },
      {
        message: 'Use window.opera instead.',
        name: 'opera',
      },
      {
        message: 'Use window.outerHeight instead.',
        name: 'outerHeight',
      },
      {
        message: 'Use window.outerWidth instead.',
        name: 'outerWidth',
      },
      {
        message: 'Use window.pageXOffset instead.',
        name: 'pageXOffset',
      },
      {
        message: 'Use window.pageYOffset instead.',
        name: 'pageYOffset',
      },
      {
        message: 'Use window.parent instead.',
        name: 'parent',
      },
      {
        message: 'Use window.print instead.',
        name: 'print',
      },
      {
        message: 'Use window.removeEventListener instead.',
        name: 'removeEventListener',
      },
      {
        message: 'Use window.resizeBy instead.',
        name: 'resizeBy',
      },
      {
        message: 'Use window.resizeTo instead.',
        name: 'resizeTo',
      },
      {
        message: 'Use window.screen instead.',
        name: 'screen',
      },
      {
        message: 'Use window.screenLeft instead.',
        name: 'screenLeft',
      },
      {
        message: 'Use window.screenTop instead.',
        name: 'screenTop',
      },
      {
        message: 'Use window.screenX instead.',
        name: 'screenX',
      },
      {
        message: 'Use window.screenY instead.',
        name: 'screenY',
      },
      {
        message: 'Use window.scroll instead.',
        name: 'scroll',
      },
      {
        message: 'Use window.scrollbars instead.',
        name: 'scrollbars',
      },
      {
        message: 'Use window.scrollBy instead.',
        name: 'scrollBy',
      },
      {
        message: 'Use window.scrollTo instead.',
        name: 'scrollTo',
      },
      {
        message: 'Use window.scrollX instead.',
        name: 'scrollX',
      },
      {
        message: 'Use window.scrollY instead.',
        name: 'scrollY',
      },
      {
        message: 'Use window.self instead.',
        name: 'self',
      },
      {
        message: 'Use window.status instead.',
        name: 'status',
      },
      {
        message: 'Use window.statusbar instead.',
        name: 'statusbar',
      },
      {
        message: 'Use window.stop instead.',
        name: 'stop',
      },
      {
        message: 'Use window.toolbar instead.',
        name: 'toolbar',
      },
      {
        message: 'Use window.top instead.',
        name: 'top',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        message: 'arguments.callee is deprecated',
        object: 'arguments',
        property: 'callee',
      },
      {
        message: 'Please use Number.isFinite instead',
        object: 'global',
        property: 'isFinite',
      },
      {
        message: 'Please use Number.isFinite instead',
        object: 'self',
        property: 'isFinite',
      },
      {
        message: 'Please use Number.isFinite instead',
        object: 'window',
        property: 'isFinite',
      },
      {
        message: 'Please use Number.isNaN instead',
        object: 'global',
        property: 'isNaN',
      },
      {
        message: 'Please use Number.isNaN instead',
        object: 'self',
        property: 'isNaN',
      },
      {
        message: 'Please use Number.isNaN instead',
        object: 'window',
        property: 'isNaN',
      },
      {
        message: 'Please use Object.defineProperty instead.',
        property: '__defineGetter__',
      },
      {
        message: 'Please use Object.defineProperty instead.',
        property: '__defineSetter__',
      },
      {
        message: 'Use the exponentiation operator (**) instead.',
        object: 'Math',
        property: 'pow',
      },
    ],
    'no-shadow': ['off'],
    'no-ternary': ['off'],
    'no-undef': ['off'],
    'no-undefined': ['off'],
    'no-underscore-dangle': [
      'error',
      {
        allow: [],
        allowAfterThis: false,
        allowAfterSuper: false,
        enforceInMethodNames: true,
      },
    ],
    'no-unmodified-loop-condition': ['off'],
    'no-unneeded-ternary': [
      'error',
      {
        defaultAssignment: false,
      },
    ],
    'no-unsafe-optional-chaining': [
      'error',
      {
        disallowArithmeticOperators: true,
      },
    ],
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    'no-unused-private-class-members': ['off'],
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'no-use-before-define': ['off'],
    'no-useless-call': ['off'],
    'no-useless-constructor': ['off'],
    'no-warning-comments': ['off'],
    'object-shorthand': [
      'error',
      'always',
      {
        avoidQuotes: true,
      },
    ],
    'one-var': ['off'],
    'operator-assignment': ['error', 'always'],
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: true,
      },
    ],
    'prefer-named-capture-group': ['off'],
    'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],
    'prefer-regex-literals': [
      'error',
      {
        disallowRedundantWrapping: true,
      },
    ],
    'require-await': ['off'],
    'require-unicode-regexp': ['off'],
    'sort-imports': ['off'],
    'sort-keys': ['off'],
    'sort-vars': ['off'],
    'unicode-bom': ['error', 'never'],
    'valid-typeof': [
      'error',
      {
        requireStringLiterals: true,
      },
    ],
  },
});
