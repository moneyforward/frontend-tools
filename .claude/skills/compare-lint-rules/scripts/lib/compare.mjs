// @ts-check

import { judgeOptionDiff } from './optionSchema.mjs';
import { canonicalize, splitRuleName } from './ruleName.mjs';
import { stableStringify } from './util.mjs';

/**
 * @typedef {'error' | 'off' | 'warn'} Severity
 */

/** @type {Record<Severity, number>} */
const SEVERITY_ORDER = { off: 0, warn: 1, error: 2 };

/**
 * @param {unknown} severity A raw severity from either side.
 *
 * @returns {Severity} The normalised severity. ESLint uses `0` / `1` / `2` and
 * oxlint uses `allow` / `warn` / `deny`.
 */
function normalizeSeverity(severity) {
  switch (severity) {
    case 0:
    case 'off':
    case 'allow':
      return 'off';
    case 1:
    case 'warn':
      return 'warn';
    case 2:
    case 'error':
    case 'deny':
      return 'error';
    default:
      return 'error';
  }
}

/**
 * @param {unknown} value A rule entry from either snapshot.
 *
 * @returns {Severity} The entry's normalised severity.
 */
function severityOf(value) {
  return normalizeSeverity(Array.isArray(value) ? value[0] : value);
}

/**
 * Groups the ESLint rules by the oxlint name they map to. Two ESLint rules can
 * canonicalise to the same oxlint rule (`react/*` and `react-hooks/*` both live
 * in oxlint's `react` scope), in which case the strictest severity wins.
 *
 * @param {Record<string, unknown>} eslintRules Rules from the ESLint snapshot.
 *
 * @param {Set<string>} configured Rule names present in the oxlint config.
 *
 * @param {Map<string, unknown>} catalogByName The oxlint rule catalog.
 *
 * @returns {Map<string, {candidates: string[], eslintNames: string[], severity: Severity}>} The
 * grouped ESLint side, keyed by canonical oxlint name.
 */
function groupByCanonical(eslintRules, configured, catalogByName) {
  const grouped = new Map();

  for (const [rule, value] of Object.entries(eslintRules)) {
    const { candidates, name } = canonicalize(rule, configured, catalogByName);
    const severity = severityOf(value);
    const existing = grouped.get(name);

    if (!existing) {
      grouped.set(name, { candidates, eslintNames: [rule], severity });
      continue;
    }

    existing.eslintNames.push(rule);

    if (SEVERITY_ORDER[severity] > SEVERITY_ORDER[existing.severity]) {
      existing.severity = severity;
    }
  }

  return grouped;
}

/**
 * Classifies every rule of both sides.
 *
 * @param {{authored: {eslint: Map<string, unknown[]> | null, oxlint: Map<string, unknown[]> | null}, catalog: import('./catalog.mjs').Catalog, eslintRules: Record<string, unknown>, optionSchema: import('./optionSchema.mjs').OptionSchema, oxlintPlugins: Set<string>, oxlintRules: Record<string, unknown>}} input Comparison input.
 *
 * @returns {Record<string, any[]>} The classified rules, each bucket sorted by
 * canonical rule name.
 */
export function compare({
  authored,
  catalog,
  eslintRules,
  optionSchema,
  oxlintPlugins,
  oxlintRules,
}) {
  const configured = new Set(Object.keys(oxlintRules));
  const eslintByCanonical = groupByCanonical(
    eslintRules,
    configured,
    catalog.byName,
  );

  /** @type {any[]} */
  const matched = [];
  /** @type {any[]} */
  const severityDiff = [];
  /** @type {any[]} */
  const missingInOxlint = [];
  /** @type {any[]} */
  const unsupported = [];
  /** @type {any[]} */
  const eslintIntentionallyOff = [];
  /** @type {any[]} */
  const optionsDiff = [];
  /** @type {any[]} */
  const bothOff = [];

  for (const [canonical, eslintSide] of eslintByCanonical) {
    const oxlintValue = oxlintRules[canonical];
    const oxlintSeverity =
      oxlintValue === undefined ? 'off' : severityOf(oxlintValue);
    const entry = {
      canonical,
      eslintNames: eslintSide.eslintNames,
      eslintSeverity: eslintSide.severity,
      oxlintSeverity: oxlintValue === undefined ? 'unset' : oxlintSeverity,
    };

    if (eslintSide.severity === 'off') {
      // oxlint enabling a rule ESLint deliberately disables produces reports the
      // ESLint setup never had.
      (oxlintSeverity === 'off' ? bothOff : eslintIntentionallyOff).push(entry);
      continue;
    }

    if (oxlintSeverity === 'off') {
      const catalogEntry = catalog.byName.get(canonical);

      if (catalogEntry) {
        missingInOxlint.push({
          ...entry,
          category: catalogEntry.category,
          pluginEnabled:
            catalogEntry.scope === '' || oxlintPlugins.has(catalogEntry.scope),
          scope: catalogEntry.scope || 'eslint',
          typeAware: catalogEntry.type_aware,
        });
      } else {
        const { base, prefix } = splitRuleName(eslintSide.eslintNames[0]);

        unsupported.push({
          ...entry,
          checkedCandidates: eslintSide.candidates,
          plugin: prefix || 'eslint (core)',
          // A same-named rule in another scope usually means the scope mapping
          // needs an entry rather than that oxlint lacks the rule.
          similar: (catalog.byBaseName.get(base) ?? []).filter(
            (name) => name !== canonical,
          ),
        });
      }

      continue;
    }

    (oxlintSeverity === eslintSide.severity ? matched : severityDiff).push(
      entry,
    );

    const difference = diffOptions(
      canonical,
      eslintSide.eslintNames,
      authored,
      optionSchema,
    );

    if (difference) {
      optionsDiff.push({ ...entry, ...difference });
    }
  }

  /** @type {any[]} */
  const oxlintOnly = [];

  for (const [rule, value] of Object.entries(oxlintRules)) {
    if (eslintByCanonical.has(rule) || severityOf(value) === 'off') {
      continue;
    }

    const catalogEntry = catalog.byName.get(rule);

    oxlintOnly.push({
      canonical: rule,
      category: catalogEntry?.category ?? 'unknown',
      oxlintSeverity: severityOf(value),
      scope: catalogEntry?.scope || 'eslint',
    });
  }

  /**
   * @param {{canonical: string}} left A classified rule.
   *
   * @param {{canonical: string}} right Another classified rule.
   *
   * @returns {number} Their relative order by canonical name.
   */
  const byName = (left, right) => left.canonical.localeCompare(right.canonical);

  return {
    bothOff: bothOff.sort(byName),
    eslintIntentionallyOff: eslintIntentionallyOff.sort(byName),
    matched: matched.sort(byName),
    missingInOxlint: missingInOxlint.sort(byName),
    optionsDiff: optionsDiff.sort(byName),
    oxlintOnly: oxlintOnly.sort(byName),
    severityDiff: severityDiff.sort(byName),
    unsupported: unsupported.sort(byName),
  };
}

/**
 * Compares the options both sides write for one rule.
 *
 * The snapshots are of no use here: ESLint's resolved config fills in schema
 * defaults, and oxlint drops rule options from `--print-config`
 * (https://github.com/oxc-project/oxc/issues/22230). Both sides therefore come
 * from the configuration sources.
 *
 * @param {string} canonical The canonical oxlint rule name.
 *
 * @param {string[]} eslintNames Every ESLint rule mapping to `canonical`.
 *
 * @param {{eslint: Map<string, unknown[]> | null, oxlint: Map<string, unknown[]> | null}} authored Authored options per side.
 *
 * @param {import('./optionSchema.mjs').OptionSchema} optionSchema The loaded option schema.
 *
 * @returns {{eslintOptions: unknown[], notes: string[], oxlintOptions: unknown[], verdict: string} | null} The
 * difference, or `null` when there is nothing to report.
 */
function diffOptions(canonical, eslintNames, authored, optionSchema) {
  if (!authored.eslint || !authored.oxlint) {
    return null;
  }

  const eslintOptions =
    eslintNames
      .map((name) => authored.eslint?.get(name))
      .find((options) => options && options.length > 0) ?? [];
  const oxlintOptions = authored.oxlint.get(canonical) ?? [];

  if (eslintOptions.length === 0 && oxlintOptions.length === 0) {
    return null;
  }

  if (stableStringify(eslintOptions) === stableStringify(oxlintOptions)) {
    return null;
  }

  return {
    ...judgeOptionDiff(canonical, eslintOptions, oxlintOptions, optionSchema),
    eslintOptions,
    oxlintOptions,
  };
}
