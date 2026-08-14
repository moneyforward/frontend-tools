// @ts-check

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { ComparisonError } from './util.mjs';

/**
 * @typedef {{category: string, docs_url: string, name: string, scope: string, type_aware: boolean, value: string}} CatalogEntry
 */

/**
 * @typedef {{byBaseName: Map<string, string[]>, byName: Map<string, CatalogEntry>}} Catalog
 */

/**
 * Loads every rule oxlint has registered. This is the source of truth for
 * whether oxlint supports a rule at all, so it follows the oxlint version
 * installed in `packages/oxlint-config`.
 *
 * @param {string} repoRoot Absolute path to the repository root.
 *
 * @returns {Catalog} The catalog indexed by configuration name (`scope/rule`,
 * unprefixed for oxlint's `eslint` scope) and by bare rule name.
 */
export function loadCatalog(repoRoot) {
  const stdout = execFileSync(
    findOxlintBinary(repoRoot),
    ['--rules', '-f', 'json'],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );

  /** @type {CatalogEntry[]} */
  const entries = JSON.parse(stdout);
  const byName = new Map();
  const byBaseName = new Map();

  for (const entry of entries) {
    const scope = toConfigScope(entry.scope);
    const name = scope ? `${scope}/${entry.value}` : entry.value;

    byName.set(name, { ...entry, name, scope });
    byBaseName.set(entry.value, [...(byBaseName.get(entry.value) ?? []), name]);
  }

  return { byBaseName, byName };
}

/**
 * Converts a catalog scope into the prefix used in configuration files.
 *
 * @param {string} scope A scope as reported by `oxlint --rules`.
 *
 * @returns {string} The configuration prefix, empty for oxlint's `eslint` scope.
 */
function toConfigScope(scope) {
  return scope === 'eslint' ? '' : scope.replace(/_/g, '-');
}

/**
 * @param {string} repoRoot Absolute path to the repository root.
 *
 * @returns {string} Absolute path to an oxlint executable.
 */
function findOxlintBinary(repoRoot) {
  const candidates = [
    'packages/oxlint-config/node_modules/.bin/oxlint',
    'packages/oxlint-config/node_modules/oxlint/bin/oxlint',
    'node_modules/.bin/oxlint',
  ].map((candidate) => path.join(repoRoot, candidate));
  const binary = candidates.find((candidate) => fs.existsSync(candidate));

  if (!binary) {
    throw new ComparisonError(
      [
        'oxlint の実行ファイルが見つかりませんでした。',
        '`pnpm install` を実行してから再実行してください。',
      ].join('\n'),
    );
  }

  return binary;
}
