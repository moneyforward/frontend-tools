# eslint-config-moneyforward

[![Version](https://img.shields.io/npm/v/eslint-config-moneyforward.svg?style=flat-square)](https://www.npmjs.com/package/eslint-config-moneyforward?activeTab=versions)
[![License](https://img.shields.io/github/license/moneyforward/frontend-tools.svg?style=flat-square)](https://github.com/moneyforward/frontend-tools/blob/main/packages/eslint-config/LICENSE)

This package provides moneyforward's `.eslintrc` as an extensible shared config.

## Usage

### 1. Install dependencies (and peer dependencies)

```bash
npm install --save-dev eslint-config-moneyforward eslint
```

### 2. Configure ESLint

#### 2a. for Flat Config

Within your ESLint config file (`eslint.config.js`):

```js
import { essentials } from 'eslint-config-moneyforward/flat';

export default [...essentials];
```

If you need TypeScript Support:

```diff
-import { essentials } from 'eslint-config-moneyforward/flat';
+import { essentials, typescript } from 'eslint-config-moneyforward/flat';

 export default [
   ...essentials,
+  ...typescript,
 ];
```

Must be added after `essentials`.

We also provide various other rule sets that you can configure to suit your project.

```js
import {
  essentials,
  jsdoc,
  next,
  node,
  react,
  storybook,
  test,
  typescript,
} from 'eslint-config-moneyforward/flat';

export default [
  ...essentials,
  ...jsdoc,
  ...next,
  ...node,
  ...react,
  ...storybook,
  ...test.react,
  ...typescript,
];
```

#### 2b. for eslintrc format

Within your ESLint config file:

```json
{
  "extends": ["moneyforward/essentials"]
}
```

If you need React Support:

```diff
{
  "extends": [
    "moneyforward/essentials",
+   "moneyforward/react",
  ]
}
```

Must be added after `essentials`.

We also provide various other rule sets that you can configure to suit your project.

```json
{
  "extends": [
    "moneyforward/essentials",
    "moneyforward/jsdoc",
    "moneyforward/next",
    "moneyforward/node",
    "moneyforward/react",
    "moneyforward/storybook",
    "moneyforward/test/react",
    "moneyforward/typescript"
  ]
}
```

|     Rule set | Summary                                               | Dependencies                                                                                                                                                                                                                                                                                     |
| -----------: | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `essentials` | Contains basic, import, and promise recommended rules | [`eslint`](https://eslint.org/) <br> [`eslint-plugin-promise`](https://github.com/eslint-community/eslint-plugin-promise) <br> [`eslint-plugin-import`](https://github.com/import-js/eslint-plugin-import) <br> [`eslint-plugin-unicorn`](https://github.com/sindresorhus/eslint-plugin-unicorn) |
|      `jsdoc` | Contains JSDoc recommended rules                      | [`eslint-plugin-jsdoc`](https://github.com/gajus/eslint-plugin-jsdoc)                                                                                                                                                                                                                            |
|       `next` | Contains Next.js recommended rules                    | [`@next/eslint-plugin-next`](https://github.com/vercel/next.js/tree/canary/packages/eslint-plugin-next)                                                                                                                                                                                          |
|       `node` | Contains Node.js recommended rules                    | [`eslint-plugin-n`](https://github.com/eslint-community/eslint-plugin-n)                                                                                                                                                                                                                         |
|      `react` | Contains React recommended rules                      | [`eslint-plugin-jsx-a11y`](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) <br> [`eslint-plugin-react-hooks`](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) <br> [`eslint-plugin-react`](https://github.com/jsx-eslint/eslint-plugin-react)              |
|  `storybook` | Contains Storybook recommended rules                  | [`eslint-plugin-storybook`](https://github.com/storybookjs/storybook/tree/next/code/lib/eslint-plugin)                                                                                                                                                                                           |
| `test/react` | Contains Jest and React Testing Library rules         | [`eslint-plugin-jest`](https://github.com/jest-community/eslint-plugin-jest) <br> [`eslint-plugin-jest-dom`](https://github.com/testing-library/eslint-plugin-jest-dom) <br> [`eslint-plugin-testing-library`](https://github.com/testing-library/eslint-plugin-testing-library)                 |
| `typescript` | Contains TypeScript recommended rules                 | [`@eslint-typescript/eslint-plugin`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/eslint-plugin) <br> [`@eslint-typescript/parser`](https://github.com/typescript-eslint/typescript-eslint/tree/main/packages/parser)                                               |

## Using Prettier

If you use [Prettier](https://prettier.io/) to format your code, you must disable any rules in `moneyforward/essentials` that conflict with Prettier.

### 1. Install dependencies

```bash
npm install --save-dev eslint-config-prettier
```

### 2. Configure ESLint

Within your ESLint config file:

```diff
// eslint.config.js

 import { essentials, react } from 'eslint-config-moneyforward/flat';
+import prettier from 'eslint-config-prettier';

 export default [
   ...essentials,
   ...react,
+  prettier,
 ],
```

```diff
// .eslintrc.js

{
  "extends": [
    "moneyforward/essentials",
    "moneyforward/react",
+   "prettier"
  ]
}
```

By adding the `prettier` configuration to `extends` in the ESLint configuration, you can disable all rules in `...essentials` (or `moneyforward/essentials`) that conflict with Prettier.

## Migrate from an existing configuration

eslint-config-moneyforward contains various plugins related to different rule sets. Therefore, users don't need to install them separately. If you have installed them in your existing configuration, we recommend uninstalling them.

```bash
npm uninstall eslint-plugin-promise eslint-plugin-import eslint-plugin-unicorn \
  eslint-plugin-jsdoc \
  @next/eslint-plugin-next \
  eslint-plugin-n \
  eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-storybook \
  eslint-plugin-jest eslint-plugin-testing-library \
  @eslint-typescript/eslint-plugin @eslint-typescript/parser
```

## Versioning

- Increment major version: Changed **error** rules.
- Increment minor version: Changed **warn** rules.
- Increment patch version: Not changed **error** and **warn** rules.

## Troubleshooting

- [ESLint Configuration Issue with Non-Standard TSConfig Filenames in Flat Config](https://github.com/moneyforward/frontend-tools/blob/main/packages/eslint-config/docs/troubleshooting/eslint-configuration-issue-with-non-standard-tsconfig-filenames-in-flat-config.md)

## License

Open source [licensed as MIT](https://github.com/moneyforward/frontend-tools/blob/main/packages/eslint-config/LICENSE).
