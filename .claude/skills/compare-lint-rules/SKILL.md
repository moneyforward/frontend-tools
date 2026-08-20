---
name: compare-lint-rules
description: Compares the snapshot test results of eslint-config-moneyforward and oxlint-config-moneyforward to judge, one granularity at a time, whether the oxlint rule sets map to the ESLint ones. Lists the differences (unset on the oxlint side, severity mismatches, enabled only on the oxlint side) and the rules oxlint does not support. Use when comparing essentials / typescript / jsdoc / nextjs / node / react / storybook / test.essentials / test.react, or when asked whether the rules are mapped or which rules oxlint cannot cover.
---

# eslint-config / oxlint-config rule mapping comparison

`oxlint-config-moneyforward` re-implements `eslint-config-moneyforward` on top of oxlint. Every rule the oxlint side ships must map to an ESLint rule **unless there is no way around it, such as oxlint not supporting the rule**. This skill compares both packages' snapshot test results and judges how far that mapping has got, one granularity at a time.

## Prerequisites

The comparison itself reads the **committed `.snap` files**, so the snapshot test for the target granularity must have been run beforehand. If it has not, point at these commands (running them to verify a freshness warning is fine; **creating** a snapshot test is out of scope):

```bash
pnpm eslint-config test run test/flat/<dir>     # ESLint side
pnpm oxlint-config test run src/configs/<dir>   # oxlint side
```

The script warns when a snapshot is older than the configuration it captures. The check only compares mtimes, so it fires on checkout order and on unrelated edits under the same tree — **it is often a false positive**. When the warning appears, run the two commands above yourself: a passing test means the snapshot matches the current configuration, and the report should say the warning was verified as a false positive rather than repeat it. Only when a test actually fails is the comparison provisional.

## Granularities and directories

| Granularity             | ESLint                                        | oxlint                                          |
| ----------------------- | --------------------------------------------- | ----------------------------------------------- |
| `essentials`            | `packages/eslint-config/test/flat/essentials` | `packages/oxlint-config/src/configs/essentials` |
| `typescript`            | `.../test/flat/typescript`                    | `.../src/configs/typescript`                    |
| `jsdoc`                 | `.../test/flat/jsdoc`                         | `.../src/configs/jsdoc`                         |
| `nextjs` (alias `next`) | `.../test/flat/next`                          | `.../src/configs/nextjs`                        |
| `node`                  | `.../test/flat/node`                          | `.../src/configs/node`                          |
| `react`                 | `.../test/flat/react`                         | `.../src/configs/react`                         |
| `storybook`             | `.../test/flat/storybook`                     | `.../src/configs/storybook`                     |
| `test.essentials`       | `.../test/flat/test/essentials`               | `.../src/configs/test/essentials`               |
| `test.react`            | `.../test/flat/test/react`                    | `.../src/configs/test/react`                    |

`GRANULARITIES` in `scripts/lib/granularities.mjs` is the single source of truth for this table. Update it there when a directory is added.

## Steps

### 1. Pick the granularity

Use the granularity passed as an argument. When none is given, offer the table above and let the user choose. **Never batch several granularities on your own** — the workflow is one granularity at a time.

### 2. Run the comparison script

```bash
node .claude/skills/compare-lint-rules/scripts/compare-lint-rules.mjs <granularity>
```

Options:

- `--json` — emit machine-readable JSON (useful for re-aggregating or filtering counts)
- `--verbose` — also list the rules that are already mapped
- `--eslint-snapshot <path>` / `--oxlint-snapshot <path>` — point at specific snapshot files
- `--repo-root <path>` — set the repository root explicitly

The script exits with code 2 when a `.snap` file is missing. Report which side's snapshot is absent, ask for the test to be created and run, and stop there. **This skill must not create snapshot tests.**

### 3. Verify the output

Do not report the script's mechanical classification as-is. Always check the following.

1. **Whether both sides compose corresponding rule sets.** Compare the `ESLint 側構成` and `oxlint 側構成` lines in the report header. The ESLint side tests are sometimes cumulative (for example `[...essentials, ...react, ...typescript]`), and if the oxlint side only has `extends: [essentials]` then most of the difference comes from that mismatch rather than from missing rules. When they do not correspond, **say so first and make clear that the differences need careful reading**.

2. **Cross-check the rules listed under 🚫 (not supported by oxlint).** When the "類似候補" (similar candidates) column shows the same rule name under another scope, the rule is probably supported and the scope mapping is what is missing. Check the catalog directly when needed:

   ```bash
   packages/oxlint-config/node_modules/.bin/oxlint --rules -f json | grep -i '<rule-name>'
   ```

   When a rule turns out to have merely been renamed or moved to another scope, propose adding it to `SCOPE_MAP` in `scripts/lib/ruleName.mjs` and re-running.

3. **That the `overrides` merge covered the rules you are reporting on.** The report header prints `解決対象ファイル`, and the oxlint side is collapsed onto that file. Spot-check a rule the oxlint rule set writes inside an `overrides[]` block (`src/rules/typescript.ts` puts its whole rule set there) and confirm the report shows the authored severity rather than the `categories` default. A whole scope showing up at `error` under ➕, or every option of a scope landing in 実質一致 / 判定不能, is the signature of a scoping miss — check `lib/fileScope.mjs` before reporting.

4. **The plugin column under ❌ (unset on the oxlint side).** A row marked `未有効 (<scope>)` means the plugin is not enabled, so writing the rule alone would have no effect. Point out that the oxlint config's `plugins` may be incomplete.

5. **How to treat the option differences.** **Options cannot be judged from the snapshots.** ESLint's `calculateConfigForFile()` fills in schema defaults (for example `no-extra-boolean-cast` is only `['error']` in `rules/errors.js`, yet the snapshot shows `[{}]`), and oxlint drops rule options from `--print-config` when object-form `extends` is used ([oxc#22230](https://github.com/oxc-project/oxc/issues/22230); runtime behaviour is unaffected). For this section only, the script therefore imports `eslint.config.mjs` / `oxlint.config.ts` instead of reading the snapshots.

   An option being absent on the oxlint side **does not mean it is unhandled**: when the eslint-config value equals oxlint's default, the oxlint side omits it on purpose. The script consults `node_modules/oxlint/configuration_schema.json` (which carries a `default` per option), resolves oxlint's effective value as "the value the rule set writes, otherwise the schema default", and splits the differences three ways:

   - **要対応 (needs work): effective values differ** — genuinely out of sync. Only these are actionable
   - **判定不能 (undecidable): oxlint's default is unknown** — the schema has no `default` (positional enums, for instance) or no option definition for the rule at all. Check oxlint's documentation
   - **実質一致 (equivalent)** — same as oxlint's default, so nothing to do

   **Never conclude that an option is "unset on the oxlint side, therefore actionable".** Report the three groups as they are.

### 4. Produce and save the report

Base the output on the script's Markdown and post the following to the chat:

- Open with a **conclusion** of about three lines: how many rules are mapped, how many need work, how many are unavoidable differences, and what to touch next
- Follow with the script's sections (long tables may be trimmed to the essentials, but **state how many rows were omitted**)
- Append the caveats found in step 3 (rule set mismatch, missing scope mapping, disabled plugin)

Write the chat summary in the language the user is writing in. The script's own Markdown output is Japanese.

Save the same content to `packages/oxlint-config/docs/mapping/<granularity>.md`, creating the directory when needed and overwriting an existing file. The raw script output does not match the repository's Prettier configuration, so format it after saving.

```bash
mkdir -p packages/oxlint-config/docs/mapping
node .claude/skills/compare-lint-rules/scripts/compare-lint-rules.mjs <granularity> > packages/oxlint-config/docs/mapping/<granularity>.md
# after prepending the conclusion section
./node_modules/.bin/prettier --write packages/oxlint-config/docs/mapping/<granularity>.md
```

Tell the user where the report was saved.

## What each classification means

| Classification                         | Meaning and handling                                                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ mapped                              | Same rule, same severity. Nothing to do                                                                                                     |
| ❌ unset on the oxlint side            | Enabled in ESLint but unset or `allow` in oxlint. **oxlint supports it, so this is actionable**                                             |
| 🚫 not supported by oxlint             | Absent from oxlint's rule catalog. Record as an **unavoidable difference**                                                                  |
| ⚠️ severity mismatch                   | Enabled on both sides but `warn` / `error` disagree. Decide which is correct and align them                                                 |
| ➕ off in ESLint but enabled in oxlint | oxlint enables something ESLint deliberately disables. **Likely to produce reports the ESLint setup never had**                             |
| ➕ enabled only in oxlint              | No corresponding ESLint rule. Either an oxlint-specific rule such as `oxc/*`, or a side effect of enabling whole `categories`               |
| option differences                     | Severities agree but the written options differ. Read from the configuration sources, and **absent does not mean unhandled** (see step 3-5) |
| off on both sides                      | Disabled on both sides. Counts only                                                                                                         |

`oxlint --rules -f json` (the binary lives at `packages/oxlint-config/node_modules/.bin/oxlint`) is the source of truth for whether oxlint supports a rule. The catalog follows the installed oxlint version, so **updating oxlint can change the verdict**.

## How the script works (for maintenance)

`scripts/compare-lint-rules.mjs` only holds the CLI — argument parsing, I/O, and exiting on error. The judgement lives in `scripts/lib/`.

| File                      | Responsibility                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `lib/granularities.mjs`   | The granularity-to-directory table (`GRANULARITIES`)                                       |
| `lib/snapshot.mjs`        | Line oriented parser that reads `rules` / `plugins` / `overrides` out of a Vitest snapshot |
| `lib/fileScope.mjs`       | The target file, glob matching, and merging oxlint's matching `overrides`                  |
| `lib/catalog.mjs`         | The rule catalog from `oxlint --rules -f json`                                             |
| `lib/optionSchema.mjs`    | Option defaults from `configuration_schema.json` and the three-way option verdict          |
| `lib/authoredOptions.mjs` | Collects the options as written in the configuration sources                               |
| `lib/ruleName.mjs`        | ESLint name to oxlint name conversion (`SCOPE_MAP`, `ruleNameAliases`)                     |
| `lib/compare.mjs`         | Rule classification                                                                        |
| `lib/report.mjs`          | Markdown output                                                                            |
| `lib/metadata.mjs`        | Snapshot freshness warnings and rule set composition                                       |
| `lib/util.mjs`            | `ComparisonError`, `stableStringify`, and friends                                          |

- Expected failures (missing snapshot, missing oxlint binary, unparsable file) throw `ComparisonError`, which the CLI turns into a message on stderr and exit code 2. Nothing under `lib/` calls `process.exit`
- Vitest snapshots cannot be `JSON.parse`d, because `pretty-format` leaves quotes inside strings unescaped (for example `"input[type="image"]"`). The parser relies on `pretty-format`'s deterministic layout — two space indentation, trailing commas — and never uses `eval`
- `SCOPE_MAP` is the single source of truth for name conversion. Candidates are generated in priority order and resolved as **present in the resolved oxlint config → present in the catalog → the first candidate**, which absorbs scope drift such as `react-hooks/*` → `react/*` and `jest/*` ↔ `vitest/*`
- Severities are normalised to `off` / `warn` / `error` from ESLint's `0` / `1` / `2` and oxlint's `allow` / `warn` / `deny`
- **Both sides are resolved for one file — the `const filePath = '...'` in the ESLint side's `snapshot.test.mts`.** ESLint's snapshot is already flattened for that file by `calculateConfigForFile()`, but oxlint's `--print-config` is not: it emits the root `rules` (the raw `categories` expansion) next to an `overrides[]` array. `lib/fileScope.mjs` matches those `overrides` against the target file and merges them in declaration order. This cannot be skipped — `src/rules/*.ts` author entire rule sets inside `overrides[]`, so reading only the root `rules` reports every rule at its category severity and every option as unwritten
- Whether a rule is enabled, and at which severity, comes from the snapshots, **after the `overrides` merge above**. **Options alone cannot be judged from the snapshots**, so `eslint.config.mjs` / `oxlint.config.ts` are imported and their `extends` chains walked (following `overrides` that match the target file), merging later definitions over earlier ones, to compare the options as written. Object key order is ignored (`stableStringify`)
- The option verdict uses `node_modules/oxlint/configuration_schema.json`: `definitions.OxlintRules` → `DummyRuleMap.properties[<rule>]` holds each rule's option definition as a positional tuple, and each property's `default` is oxlint's default value
- **oxlint spells plugin scopes two ways.** `--print-config` and `--rules` normalise to `jsx_a11y/*`, while configuration files and `configuration_schema.json` keep `jsx-a11y/*`. Any lookup keyed by a resolved rule name must go through `ruleNameAliases()`, which yields both spellings — `lib/optionSchema.mjs` (schema lookup) and `lib/compare.mjs` (authored options) do. Skipping it silently reports every `jsx_a11y` option as "oxlint has no option definition for this rule"
