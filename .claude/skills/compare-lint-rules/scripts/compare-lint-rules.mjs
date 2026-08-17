#!/usr/bin/env node
// @ts-check

/**
 * Compares the rule sets captured by the `eslint-config-moneyforward` and
 * `oxlint-config-moneyforward` snapshot tests, and classifies every rule into
 * "mapped", "severity mismatch", "missing on the oxlint side (but supported by
 * oxlint)", "not supported by oxlint", and "oxlint only".
 *
 * Rule severities come from the committed Vitest snapshots, so the snapshot tests
 * must have been run beforehand. `oxlint --rules -f json` is the source of truth
 * for whether oxlint supports a rule at all, and rule options are read from both
 * sides' configuration sources rather than the snapshots (see
 * `lib/authoredOptions.mjs`).
 *
 * Both sides are resolved for the single file the ESLint snapshot test targets:
 * ESLint's snapshot is already flattened for it, while oxlint's `overrides[]`
 * have to be matched and merged here (see `lib/fileScope.mjs`).
 *
 * Usage:
 *   node .claude/skills/compare-lint-rules/scripts/compare-lint-rules.mjs <granularity> [options]
 *
 * Options:
 *   --json                     Emits machine-readable JSON instead of Markdown.
 *   --verbose                  Lists every mapped rule instead of only counting them.
 *   --eslint-snapshot <path>   Overrides the ESLint side snapshot file.
 *   --oxlint-snapshot <path>   Overrides the oxlint side snapshot file.
 *   --repo-root <path>         Overrides repository root detection.
 */

import fs from 'node:fs';
import path from 'node:path';

import { loadAuthoredOptions } from './lib/authoredOptions.mjs';
import { loadCatalog } from './lib/catalog.mjs';
import { compare } from './lib/compare.mjs';
import { readTargetFile, resolveForFile } from './lib/fileScope.mjs';
import { granularityNames, resolveGranularity } from './lib/granularities.mjs';
import { collectWarnings, readComposition } from './lib/metadata.mjs';
import { loadOptionSchema } from './lib/optionSchema.mjs';
import { renderMarkdown } from './lib/report.mjs';
import { readSections } from './lib/snapshot.mjs';
import { ComparisonError } from './lib/util.mjs';

try {
  await main();
} catch (error) {
  if (!(error instanceof ComparisonError)) {
    throw error;
  }

  process.stderr.write(
    `${error.message}\n${error.showUsage ? `\n${usage()}` : ''}`,
  );
  process.exit(2);
}

async function main() {
  const options = parseArgv(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(usage());

    return;
  }

  const repoRoot = options.repoRoot ?? findRepoRoot();
  const { eslintDir, granularity, oxlintDir } = resolveGranularity(
    options.granularity,
  );
  const eslintDirAbs = path.join(repoRoot, eslintDir);
  const oxlintDirAbs = path.join(repoRoot, oxlintDir);
  const eslintSnapshot =
    options.eslintSnapshot ??
    path.join(eslintDirAbs, '__snapshots__/snapshot.test.mts.snap');
  const oxlintSnapshot =
    options.oxlintSnapshot ??
    path.join(oxlintDirAbs, '__snapshots__/snapshot.test.ts.snap');

  requireSnapshots(granularity, repoRoot, [eslintSnapshot, oxlintSnapshot]);

  // The ESLint snapshot is resolved for exactly one file, so the oxlint side has
  // to be collapsed onto that same file before the two are comparable.
  const targetFile = readTargetFile(eslintDirAbs);

  const eslintRules = readSections(eslintSnapshot, 'ESLint', ['rules']).rules;
  const {
    overrides,
    plugins,
    rules: oxlintRootRules,
  } = readSections(oxlintSnapshot, 'oxlint', ['rules', 'plugins', 'overrides']);
  const resolved = resolveForFile(oxlintRootRules, overrides, targetFile);
  const oxlintRules = resolved.rules;
  const oxlintPlugins = new Set([
    ...(Array.isArray(plugins) ? plugins : []),
    ...resolved.plugins,
  ]);
  const authoredEslint = await loadAuthoredOptions(
    'eslint',
    eslintDirAbs,
    targetFile,
  );
  const authoredOxlint = await loadAuthoredOptions(
    'oxlint',
    oxlintDirAbs,
    targetFile,
  );

  const result = compare({
    authored: {
      eslint: authoredEslint.options,
      oxlint: authoredOxlint.options,
    },
    catalog: loadCatalog(repoRoot),
    eslintRules,
    optionSchema: loadOptionSchema(repoRoot),
    oxlintPlugins,
    oxlintRules,
  });

  const meta = {
    authoredOptionsErrors: [authoredEslint.error, authoredOxlint.error].filter(
      (error) => error !== null,
    ),
    eslintComposition: readComposition(
      path.join(eslintDirAbs, 'eslint.config.mjs'),
      /export default (\[[\s\S]*?\]);/,
    ),
    eslintRuleCount: Object.keys(eslintRules).length,
    eslintSnapshot: path.relative(repoRoot, eslintSnapshot),
    granularity,
    oxlintComposition: readComposition(
      path.join(oxlintDirAbs, 'oxlint.config.ts'),
      /extends:\s*(\[[\s\S]*?\])/,
    ),
    oxlintPlugins: [...oxlintPlugins],
    oxlintRuleCount: Object.keys(oxlintRules).length,
    oxlintSnapshot: path.relative(repoRoot, oxlintSnapshot),
    targetFile,
    warnings: collectWarnings({
      eslintDirAbs,
      eslintSnapshot,
      oxlintDirAbs,
      oxlintSnapshot,
      repoRoot,
    }),
  };

  process.stdout.write(
    options.json
      ? `${JSON.stringify({ ...meta, ...result }, null, 2)}\n`
      : renderMarkdown(meta, result, options),
  );
}

/**
 * @param {string} granularity The granularity being compared.
 *
 * @param {string} repoRoot Absolute path to the repository root.
 *
 * @param {string[]} snapshots Snapshot files both sides need.
 *
 * @returns {void}
 *
 * @throws {ComparisonError} When a snapshot is missing.
 */
function requireSnapshots(granularity, repoRoot, snapshots) {
  const missing = snapshots.filter((file) => !fs.existsSync(file));

  if (missing.length === 0) {
    return;
  }

  throw new ComparisonError(
    [
      `snapshot ファイルが見つかりません（粒度: ${granularity}）:`,
      ...missing.map((file) => `  - ${path.relative(repoRoot, file)}`),
      '',
      '該当粒度の snapshot テストを作成・実行してから再実行してください。',
    ].join('\n'),
  );
}

/**
 * @param {string[]} argv Raw command line arguments.
 *
 * @returns {{eslintSnapshot?: string, granularity?: string, help: boolean, json: boolean, oxlintSnapshot?: string, repoRoot?: string, verbose: boolean}} Parsed options.
 */
function parseArgv(argv) {
  /** @type {any} */
  const options = { help: false, json: false, verbose: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--eslint-snapshot':
        options.eslintSnapshot = path.resolve(argv[(index += 1)]);
        break;
      case '--oxlint-snapshot':
        options.oxlintSnapshot = path.resolve(argv[(index += 1)]);
        break;
      case '--repo-root':
        options.repoRoot = path.resolve(argv[(index += 1)]);
        break;
      default:
        if (arg.startsWith('-')) {
          throw new ComparisonError(`不明なオプション: ${arg}`, {
            showUsage: true,
          });
        }

        options.granularity ??= arg;
    }
  }

  return options;
}

/**
 * @returns {string} The usage text.
 */
function usage() {
  return [
    'Usage: node .claude/skills/compare-lint-rules/scripts/compare-lint-rules.mjs <granularity> [options]',
    '',
    `granularity: ${granularityNames().join(' | ')}`,
    '',
    'Options:',
    '  --json                     JSON で出力する',
    '  --verbose                  マッピング済みルールも一覧表示する',
    '  --eslint-snapshot <path>   ESLint 側 snapshot ファイルを指定する',
    '  --oxlint-snapshot <path>   oxlint 側 snapshot ファイルを指定する',
    '  --repo-root <path>         リポジトリルートを指定する',
    '',
  ].join('\n');
}

/**
 * Walks up from this script until the directory that holds both packages.
 *
 * @returns {string} Absolute path to the repository root.
 */
function findRepoRoot() {
  let current = import.meta.dirname;

  while (true) {
    if (
      fs.existsSync(path.join(current, 'packages/eslint-config')) &&
      fs.existsSync(path.join(current, 'packages/oxlint-config'))
    ) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new ComparisonError(
        'リポジトリルートを特定できませんでした。--repo-root で指定してください。',
      );
    }

    current = parent;
  }
}
