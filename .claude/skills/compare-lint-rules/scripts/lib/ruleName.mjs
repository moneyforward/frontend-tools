// @ts-check

/**
 * Maps an ESLint plugin prefix to the oxlint scopes that may provide the
 * equivalent rule, in priority order. An empty string means oxlint's `eslint`
 * scope, which carries no prefix in configuration files. An empty array means
 * oxlint has no scope covering the plugin at all.
 *
 * This table is the single source of truth for prefix mapping. Extend it here
 * when oxlint gains a new plugin scope.
 *
 * @type {Record<string, string[]>}
 */
const SCOPE_MAP = {
  '': [''],
  '@next/next': ['nextjs'],
  '@typescript-eslint': ['typescript', ''],
  import: ['import'],
  jest: ['jest', 'vitest'],
  'jest-dom': [],
  jsdoc: ['jsdoc'],
  'jsx-a11y': ['jsx-a11y'],
  n: ['node'],
  node: ['node'],
  promise: ['promise'],
  react: ['react', 'react-perf'],
  'react-hooks': ['react'],
  storybook: [],
  'testing-library': [],
  unicorn: ['unicorn'],
  vitest: ['vitest', 'jest'],
};

/**
 * @param {string} rule An ESLint rule name.
 *
 * @returns {{base: string, prefix: string}} The plugin prefix and bare rule name.
 */
export function splitRuleName(rule) {
  const segments = rule.split('/');

  if (rule.startsWith('@')) {
    return segments.length > 2
      ? {
          base: segments.slice(2).join('/'),
          prefix: segments.slice(0, 2).join('/'),
        }
      : { base: segments[1] ?? '', prefix: segments[0] };
  }

  return segments.length > 1
    ? { base: segments.slice(1).join('/'), prefix: segments[0] }
    : { base: rule, prefix: '' };
}

/**
 * Resolves the oxlint configuration name that corresponds to an ESLint rule.
 *
 * Several oxlint scopes can plausibly host the same rule (`react-hooks/*` lives
 * in oxlint's `react` scope, jest rules also exist under `vitest`), so the
 * candidates are tried against the resolved oxlint config first, then against
 * the catalog, before falling back to the highest priority candidate.
 *
 * @param {string} rule An ESLint rule name.
 *
 * @param {Set<string>} configured Rule names present in the oxlint config.
 *
 * @param {Map<string, unknown>} catalogByName The oxlint rule catalog.
 *
 * @returns {{candidates: string[], name: string}} The canonical oxlint name and
 * every candidate that was considered.
 */
export function canonicalize(rule, configured, catalogByName) {
  const { base, prefix } = splitRuleName(rule);
  const scopes = SCOPE_MAP[prefix] ?? [prefix];
  const candidates = scopes.map((scope) => (scope ? `${scope}/${base}` : base));

  // A plugin oxlint has no scope for still needs a name to report.
  if (candidates.length === 0) {
    candidates.push(rule);
  }

  // oxlint keeps some ported rules in its own `oxc` scope.
  candidates.push(`oxc/${base}`);

  const unique = [...new Set(candidates)];
  const resolved =
    unique.find((candidate) => configured.has(candidate)) ??
    unique.find((candidate) => catalogByName.has(candidate)) ??
    unique[0];

  return { candidates: unique, name: resolved };
}
