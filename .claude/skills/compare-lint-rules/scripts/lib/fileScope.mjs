// @ts-check

/**
 * Resolves the file scoping that both sides express differently.
 *
 * The ESLint snapshot is already resolved for one concrete file, because
 * `calculateConfigForFile()` flattens every matching config object into a single
 * `rules` map. oxlint's `--print-config` does not: it emits the root `rules`
 * alongside an `overrides[]` array, and leaves the matching to the linter. A
 * comparison that reads only the root `rules` therefore sees the raw
 * `categories` expansion and misses every rule the rule sets actually author,
 * because `src/rules/*.ts` put their rules inside `overrides[]`.
 *
 * Everything here exists to line the oxlint side up with the single file the
 * ESLint snapshot was resolved for.
 */

import fs from 'node:fs';
import path from 'node:path';

import { ComparisonError } from './util.mjs';

/**
 * Reads the file path a granularity's ESLint snapshot test resolves its config
 * for. That path is the basis for the whole comparison, so it is read from the
 * test source rather than duplicated in a table that could drift.
 *
 * @param {string} eslintDirAbs Absolute path to the ESLint side directory.
 *
 * @returns {string} The target file path, normalised without a leading `./`.
 *
 * @throws {ComparisonError} When the test file or the path cannot be read.
 */
export function readTargetFile(eslintDirAbs) {
  const file = path.join(eslintDirAbs, 'snapshot.test.mts');

  if (!fs.existsSync(file)) {
    throw new ComparisonError(
      `ESLint 側の snapshot テストが見つかりません: ${file}`,
    );
  }

  const match = /\bfilePath\s*=\s*['"`]([^'"`]+)['"`]/.exec(
    fs.readFileSync(file, 'utf8'),
  );

  if (!match) {
    throw new ComparisonError(
      [
        `${file} から対象ファイルパス（\`const filePath = '...'\`）を読み取れませんでした。`,
        'oxlint 側の overrides をどのファイルに対して解決すべきか決まらないため、比較を続行できません。',
      ].join('\n'),
    );
  }

  return match[1].replace(/^\.\//, '');
}

/**
 * Flattens oxlint's root `rules` with every `overrides[]` entry whose `files`
 * patterns match the target file, in declaration order so that later entries
 * win — the same precedence oxlint applies at runtime.
 *
 * @param {Record<string, unknown>} rootRules The snapshot's root `rules` map.
 *
 * @param {any[] | undefined} overrides The snapshot's `overrides` array.
 *
 * @param {string} targetFile The file the ESLint side resolved its config for.
 *
 * @returns {{plugins: string[], rules: Record<string, unknown>}} The rules in
 * effect for `targetFile`, plus the plugins the matching overrides enable.
 */
export function resolveForFile(rootRules, overrides, targetFile) {
  const rules = { ...rootRules };
  const plugins = [];

  for (const override of matchingOverrides(overrides, targetFile)) {
    Object.assign(rules, override.rules ?? {});
    plugins.push(...(override.plugins ?? []));
  }

  return { plugins, rules };
}

/**
 * @param {any[] | undefined} overrides The snapshot's `overrides` array.
 *
 * @param {string} targetFile The file the ESLint side resolved its config for.
 *
 * @returns {any[]} The overrides that apply to `targetFile`, in order.
 */
export function matchingOverrides(overrides, targetFile) {
  return (Array.isArray(overrides) ? overrides : []).filter((override) =>
    (override?.files ?? []).some((pattern) => matchesGlob(pattern, targetFile)),
  );
}

/**
 * Matches a path against one of the glob patterns oxlint accepts in `files`.
 *
 * Only the subset the rule sets use is supported: `**`, `*`, `?`, and brace
 * alternatives such as `{ts,tsx,cts,mts}`. A leading `**​/` matches zero or more
 * directories, so `**​/*.ts` matches both `dummy.ts` and `apps/dummy.ts`.
 *
 * @param {string} pattern A glob pattern.
 *
 * @param {string} filePath A path, normalised without a leading `./`.
 *
 * @returns {boolean} `true` when the pattern matches.
 */
export function matchesGlob(pattern, filePath) {
  let source = '';

  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];

    if (char === '*') {
      if (pattern[index + 1] === '*') {
        // `**/` may consume nothing at all, so that a root level file still
        // matches. A bare `**` crosses directory separators.
        if (pattern[index + 2] === '/') {
          source += '(?:[^/]*/)*';
          index += 2;
        } else {
          source += '.*';
          index += 1;
        }
      } else {
        source += '[^/]*';
      }

      continue;
    }

    if (char === '?') {
      source += '[^/]';
      continue;
    }

    if (char === '{') {
      const end = pattern.indexOf('}', index);

      if (end > index) {
        source += `(?:${pattern
          .slice(index + 1, end)
          .split(',')
          .map(escapeRegExp)
          .join('|')})`;
        index = end;
        continue;
      }
    }

    source += escapeRegExp(char);
  }

  return new RegExp(`^${source}$`).test(filePath);
}

/**
 * @param {string} value A literal to embed in a regular expression.
 *
 * @returns {string} The escaped literal.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
