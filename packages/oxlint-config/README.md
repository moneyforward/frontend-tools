# oxlint-config-moneyforward

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

The Oxlint rules of Money Forward, Inc as an extensible shared config.

## Usage

### 1. Install dependencies (and peer dependencies)

```bash
npm install --save-dev oxlint-config-moneyforward oxlint oxlint-tsgolint
```

### 2. Configure oxlint

Oxlint supports both `oxlint.config.ts` and `.oxlintrc.json`.
Use either one in the same directory (not both).

#### Option A: `oxlint.config.ts` (recommended)

```ts
import { defineConfig } from 'oxlint';
import { essentials } from 'oxlint-config-moneyforward';

export default defineConfig({
  extends: [essentials],
});
```

If you need TypeScript support:

```ts
import { defineConfig } from 'oxlint';
import { essentials, typescript } from 'oxlint-config-moneyforward';

export default defineConfig({
  extends: [essentials, typescript],
});
```

`typescript` must be added after `essentials`.

You can also combine other provided rule sets:

```ts
import { defineConfig } from 'oxlint';
import {
  essentials,
  jsdoc,
  nextjs,
  node,
  react,
  storybook,
  test,
  typescript,
} from 'oxlint-config-moneyforward';

export default defineConfig({
  extends: [
    essentials,
    typescript,
    jsdoc,
    node,
    react,
    nextjs,
    storybook,
    test.essentials,
    test.react,
  ],
});
```

#### Option B: `.oxlintrc.json`

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": [
    "./node_modules/oxlint-config-moneyforward/dist/configs/essentials.json"
  ]
}
```

If you need TypeScript support:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": [
    "./node_modules/oxlint-config-moneyforward/dist/configs/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/typescript.json"
  ]
}
```

You can combine other JSON presets as well, for example:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": [
    "./node_modules/oxlint-config-moneyforward/dist/configs/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/typescript.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/jsdoc.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/node.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/react.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/nextjs.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/storybook.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/test/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/test/react.json"
  ]
}
```

You can combine other JSON presets as well (for example `react.json`, `nextjs.json`, `test/essentials.json`).

|          Rule set | Summary                                                                                                                                      |
| ----------------: | -------------------------------------------------------------------------------------------------------------------------------------------- |
|      `essentials` | Contains basic, import, and promise recommended rules.                                                                                       |
|      `typescript` | Contains TypeScript recommended rules.                                                                                                       |
|           `jsdoc` | Contains JSDoc recommended rules.                                                                                                            |
|            `node` | Contains Node.js recommended rules.                                                                                                          |
|           `react` | Contains React and jsx-a11y recommended rules.                                                                                               |
|          `nextjs` | Contains Next.js recommended rules.                                                                                                          |
|       `storybook` | Contains Storybook rules. This is an optional advanced module.                                                                               |
| `test.essentials` | Contains core rules for JavaScript / TypeScript test code.                                                                                   |
|      `test.react` | Contains React-specific test rules, including Testing Library / jest-dom equivalent rules where needed. This is an optional advanced module. |

## Advanced modules

Some rule sets are provided as optional advanced modules.

Advanced modules are not part of the baseline configuration. Use them only when your repository needs the corresponding checks.

The following modules are advanced modules:

- `storybook`
- `test.react`

These modules may depend on Oxlint's JS Plugins feature to provide rules equivalent to existing ESLint plugins.

### `storybook`

Use `storybook` when your repository contains Storybook stories and you want to keep Storybook-related lint rules aligned with the Money Forward standard.

```ts
import { defineConfig } from 'oxlint';
import {
  essentials,
  react,
  storybook,
  typescript,
} from 'oxlint-config-moneyforward';

export default defineConfig({
  extends: [essentials, typescript, react, storybook],
});
```

JSON config:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",

  "extends": [
    "./node_modules/oxlint-config-moneyforward/dist/configs/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/typescript.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/react.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/storybook.json"
  ]
}
```

If your repository does not use Storybook, you do not need to enable this module.

### `test.react`

Use `test.react` when your repository contains React component tests or custom hook tests.

This module is intended to provide React-specific test rules, including Testing Library / jest-dom equivalent rules where needed.

`test.react` should be used together with `test.essentials`.

```ts
import { defineConfig } from 'oxlint';

import {
  essentials,
  react,
  test,
  typescript,
} from 'oxlint-config-moneyforward';

export default defineConfig({
  extends: [essentials, typescript, react, test.essentials, test.react],
});
```

JSON config:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",

  "extends": [
    "./node_modules/oxlint-config-moneyforward/dist/configs/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/typescript.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/react.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/test/essentials.json",
    "./node_modules/oxlint-config-moneyforward/dist/configs/test/react.json"
  ]
}
```

If your repository has only general JavaScript / TypeScript tests and does not test React components or hooks, `test.essentials` may be enough.

## About JS Plugins

`oxlint-config-moneyforward` uses Oxlint native rules whenever possible.

Some optional advanced modules may use Oxlint's JS Plugins feature to provide rules equivalent to existing ESLint plugins that are part of the current Money Forward linting standard.

This allows product teams to reuse the shared standard without manually adding the same JS Plugins in each repository.

However, JS Plugins based modules have a different maintenance policy from Oxlint-native modules:

- They are optional and are not included in `essentials`.
- They may require additional maintenance compared with Oxlint-native modules.
- They may be replaced by Oxlint-native rules when Oxlint provides equivalent native support.
- They may be deprecated or removed if the underlying ESLint plugin becomes unhealthy or difficult to maintain.
- If a module is replaced or removed, migration guidance will be provided.

## Integration with ESLint

You can integrate oxlint with ESLint using the [eslint-plugin-oxlint](https://www.npmjs.com/package/eslint-plugin-oxlint) if you still need ESLint that oxlint does not cover yet. This plugin turns off all rules that are already covered by oxlint to avoid conflicts.

```js
import oxlint from 'eslint-plugin-oxlint';

export default [
  // Other ESLint configs...

  ...oxlint.configs['flat/all'],
];
```

Then, run ESLint after oxlint:

```bash
npx oxlint --type-aware && npx eslint
```

## Versioning

- Increment major version: Changed **error** rules.
- Increment minor version: Changed **warn** rules.
- Increment patch version: Not changed **error** and **warn** rules.

## License

Open source [licensed as MIT](https://github.com/moneyforward/frontend-tools/blob/main/packages/eslint-config/LICENSE).
