// @ts-check

import fs from 'node:fs';
import path from 'node:path';

import { newestMtime } from './util.mjs';

/**
 * Warns when a snapshot file is older than the configuration it captures, which
 * means the snapshot test has not been re-run since the last edit.
 *
 * @param {{eslintDirAbs: string, eslintSnapshot: string, oxlintDirAbs: string, oxlintSnapshot: string, repoRoot: string}} input Paths to inspect.
 *
 * @returns {string[]} Warning messages.
 */
export function collectWarnings({
  eslintDirAbs,
  eslintSnapshot,
  oxlintDirAbs,
  oxlintSnapshot,
  repoRoot,
}) {
  const sides = [
    {
      label: 'ESLint',
      snapshot: eslintSnapshot,
      sources: [
        path.join(eslintDirAbs, 'eslint.config.mjs'),
        path.join(repoRoot, 'packages/eslint-config/configs'),
        path.join(repoRoot, 'packages/eslint-config/rules'),
      ],
    },
    {
      label: 'oxlint',
      snapshot: oxlintSnapshot,
      sources: [
        path.join(oxlintDirAbs, 'oxlint.config.ts'),
        path.join(repoRoot, 'packages/oxlint-config/src'),
      ],
    },
  ];

  return sides
    .filter(
      (side) =>
        Math.max(...side.sources.map(newestMtime)) >
        fs.statSync(side.snapshot).mtimeMs,
    )
    .map(
      (side) =>
        `${side.label} 側の snapshot (\`${path.relative(repoRoot, side.snapshot)}\`) が設定ソースより古いため、snapshot テストの再実行が必要な可能性があります。`,
    );
}

/**
 * Extracts the rule set composition from a config file so the report can show
 * whether both sides compose corresponding presets.
 *
 * @param {string} file Absolute path to a config file.
 *
 * @param {RegExp} pattern Pattern whose first capture group holds the composition.
 *
 * @returns {string} A single line description, or a fallback message.
 */
export function readComposition(file, pattern) {
  if (!fs.existsSync(file)) {
    return '(ファイルなし)';
  }

  const matched = pattern.exec(fs.readFileSync(file, 'utf8'));

  return matched
    ? matched[1].replace(/\s+/g, ' ').replace(/,\s*\]/, ']')
    : '(取得不可)';
}
