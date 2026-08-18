// @ts-check

import { ComparisonError } from './util.mjs';

/**
 * Maps a comparison granularity to the directory that holds each side's
 * snapshot test. Paths are relative to the repository root.
 *
 * This table is the single source of truth for the granularity layout. Add an
 * entry here when a new rule set gains a snapshot test.
 *
 * @type {Record<string, {eslintDir: string, oxlintDir: string}>}
 */
export const GRANULARITIES = {
  essentials: {
    eslintDir: 'packages/eslint-config/test/flat/essentials',
    oxlintDir: 'packages/oxlint-config/src/configs/essentials',
  },
  typescript: {
    eslintDir: 'packages/eslint-config/test/flat/typescript',
    oxlintDir: 'packages/oxlint-config/src/configs/typescript',
  },
  jsdoc: {
    eslintDir: 'packages/eslint-config/test/flat/jsdoc',
    oxlintDir: 'packages/oxlint-config/src/configs/jsdoc',
  },
  nextjs: {
    eslintDir: 'packages/eslint-config/test/flat/next',
    oxlintDir: 'packages/oxlint-config/src/configs/nextjs',
  },
  node: {
    eslintDir: 'packages/eslint-config/test/flat/node',
    oxlintDir: 'packages/oxlint-config/src/configs/node',
  },
  react: {
    eslintDir: 'packages/eslint-config/test/flat/react',
    oxlintDir: 'packages/oxlint-config/src/configs/react',
  },
  storybook: {
    eslintDir: 'packages/eslint-config/test/flat/storybook',
    oxlintDir: 'packages/oxlint-config/src/configs/storybook',
  },
  'test.essentials': {
    eslintDir: 'packages/eslint-config/test/flat/test/essentials',
    oxlintDir: 'packages/oxlint-config/src/configs/test/essentials',
  },
  'test.react': {
    eslintDir: 'packages/eslint-config/test/flat/test/react',
    oxlintDir: 'packages/oxlint-config/src/configs/test/react',
  },
};

/**
 * Accepts the shorter names that appear in the ESLint side directory layout.
 *
 * @type {Record<string, string>}
 */
const GRANULARITY_ALIASES = {
  next: 'nextjs',
  ts: 'typescript',
  'test-essentials': 'test.essentials',
  'test-react': 'test.react',
};

/**
 * @returns {string[]} Every granularity name, in declaration order.
 */
export function granularityNames() {
  return Object.keys(GRANULARITIES);
}

/**
 * @param {string | undefined} name A granularity name or alias.
 *
 * @returns {{eslintDir: string, granularity: string, oxlintDir: string}} The
 * resolved granularity and its directories.
 *
 * @throws {ComparisonError} When the name is missing or unknown.
 */
export function resolveGranularity(name) {
  const granularity = GRANULARITY_ALIASES[name ?? ''] ?? name;

  if (!granularity || !GRANULARITIES[granularity]) {
    throw new ComparisonError(
      `粒度を指定してください。指定可能な粒度: ${granularityNames().join(', ')}`,
      { showUsage: true },
    );
  }

  return { granularity, ...GRANULARITIES[granularity] };
}
