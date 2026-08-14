// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {{error: string | null, options: Map<string, unknown[]> | null}} AuthoredOptions
 */

/**
 * Collects the rule options as they are written in each side's configuration
 * source.
 *
 * Neither snapshot can answer this question. ESLint's resolved config fills in
 * every rule's schema defaults, so its snapshot cannot distinguish a deliberate
 * option from a default. oxlint strips rule options from `--print-config` when
 * object-form `extends` is used, so its snapshot shows no options at all even
 * when the rule set defines them
 * (https://github.com/oxc-project/oxc/issues/22230).
 *
 * A failure here is not fatal: the caller reports the option section as
 * undecidable and keeps the rest of the comparison.
 *
 * @param {'eslint' | 'oxlint'} side Which side to load.
 *
 * @param {string} dir Absolute path to the side's config directory.
 *
 * @returns {Promise<AuthoredOptions>} The authored options keyed by rule name,
 * or an error message when the source could not be loaded.
 */
export async function loadAuthoredOptions(side, dir) {
  const entry = path.join(
    dir,
    side === 'eslint' ? 'eslint.config.mjs' : 'oxlint.config.ts',
  );

  if (!fs.existsSync(entry)) {
    return { error: `${entry} が見つかりません`, options: null };
  }

  // The ESLint side reads this when building parser options at module load.
  process.env.TSCONFIG_ROOT_DIR ??= '/dummy';

  try {
    const loaded = await import(pathToFileURL(entry).href);
    const options = new Map();

    collectAuthoredRules(loaded.default, options);

    return { error: null, options };
  } catch (error) {
    return {
      error: `${path.basename(entry)} を読み込めませんでした: ${error instanceof Error ? error.message : String(error)}`,
      options: null,
    };
  }
}

/**
 * Walks a flat ESLint config array or an oxlint config object, merging every
 * `rules` map in resolution order so that later definitions win.
 *
 * oxlint's `overrides` are deliberately skipped: they are file scoped and are not
 * part of the baseline the comparison is about.
 *
 * @param {any} config A config array, config object, or `extends` entry.
 *
 * @param {Map<string, unknown[]>} into Accumulator keyed by rule name.
 *
 * @returns {void}
 */
function collectAuthoredRules(config, into) {
  if (!config || typeof config !== 'object') {
    return;
  }

  if (Array.isArray(config)) {
    for (const entry of config) {
      collectAuthoredRules(entry, into);
    }

    return;
  }

  // oxlint resolves `extends` before the config's own rules.
  collectAuthoredRules(config.extends, into);

  for (const [rule, value] of Object.entries(config.rules ?? {})) {
    into.set(rule, Array.isArray(value) ? value.slice(1) : []);
  }
}
