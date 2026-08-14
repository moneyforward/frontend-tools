// @ts-check

import fs from 'node:fs';
import path from 'node:path';

import { stableStringify } from './util.mjs';

/**
 * @typedef {{resolve: (node: any) => any, slotsOf: (rule: string) => any[] | null}} OptionSchema
 */

/**
 * Loads oxlint's JSON schema, which documents each rule's option shape and the
 * default value of every option. This is what makes it possible to tell an
 * option oxlint deliberately omits (because the value equals its default) from
 * one that is genuinely missing.
 *
 * @param {string} repoRoot Absolute path to the repository root.
 *
 * @returns {OptionSchema} A lookup for a rule's positional option schemas,
 * excluding the leading severity slot. Every rule reports `null` when the schema
 * is unavailable.
 */
export function loadOptionSchema(repoRoot) {
  const file = path.join(
    repoRoot,
    'packages/oxlint-config/node_modules/oxlint/configuration_schema.json',
  );

  if (!fs.existsSync(file)) {
    return { resolve: (node) => node, slotsOf: () => null };
  }

  const definitions =
    JSON.parse(fs.readFileSync(file, 'utf8')).definitions ?? {};

  /**
   * @param {any} node A schema node that may be a `$ref`.
   *
   * @returns {any} The resolved node.
   */
  const resolve = (node) => {
    let current = node;

    for (let depth = 0; current?.$ref && depth < 10; depth += 1) {
      current = definitions[current.$ref.split('/').pop()];
    }

    return current ?? {};
  };

  // `OxlintRules` is itself a chain of `$ref`s ending in the map that holds one
  // property per rule.
  const properties = resolve(definitions.OxlintRules)?.properties ?? {};

  return {
    resolve,
    slotsOf(rule) {
      const tuple = properties[rule]?.anyOf?.find(
        (variant) => variant.type === 'array' && Array.isArray(variant.items),
      );

      return tuple ? tuple.items.slice(1).map(resolve) : null;
    },
  };
}

/**
 * Decides whether an option difference is real, by resolving oxlint's effective
 * value for every option: the value the rule set writes when present, otherwise
 * the default declared in oxlint's schema.
 *
 * @param {string} rule The oxlint rule name.
 *
 * @param {unknown[]} eslintOptions Options authored on the ESLint side.
 *
 * @param {unknown[]} oxlintOptions Options authored on the oxlint side.
 *
 * @param {OptionSchema} schema The loaded option schema.
 *
 * @returns {{notes: string[], verdict: 'differs' | 'equivalent' | 'unknown'}} `differs`
 * when the effective values disagree, `equivalent` when oxlint merely omits a
 * value equal to its default, and `unknown` when the schema does not declare
 * enough to decide.
 */
export function judgeOptionDiff(rule, eslintOptions, oxlintOptions, schema) {
  const slots = schema.slotsOf(rule);

  if (!slots) {
    return {
      notes: ['oxlint のスキーマにこのルールのオプション定義がない'],
      verdict: 'unknown',
    };
  }

  const notes = [];
  let unknown = false;

  eslintOptions.forEach((expected, index) => {
    const slot = slots[index];
    const authored = oxlintOptions[index];

    if (!slot) {
      notes.push(`位置 ${index}: oxlint に対応するオプションがない`);

      return;
    }

    if (isPlainObject(expected)) {
      for (const [key, value] of Object.entries(expected)) {
        const property = slot.properties?.[key];

        if (!property) {
          notes.push(`\`${key}\`: oxlint に該当オプションがない`);
          continue;
        }

        const fallback = defaultOf(property, schema);
        const effective =
          isPlainObject(authored) && key in authored ? authored[key] : fallback;

        if (effective === undefined) {
          unknown = true;
          notes.push(`\`${key}\`: oxlint の既定値がスキーマに無く判定不能`);
          continue;
        }

        if (stableStringify(effective) !== stableStringify(value)) {
          notes.push(
            `\`${key}\`: ESLint=${JSON.stringify(value)} / oxlint=${JSON.stringify(effective)}`,
          );
        }
      }

      return;
    }

    const effective = authored === undefined ? slot.default : authored;

    if (effective === undefined) {
      unknown = true;
      notes.push(
        `位置 ${index}: oxlint の既定値がスキーマに無く判定不能（ESLint=${JSON.stringify(expected)}）`,
      );

      return;
    }

    if (stableStringify(effective) !== stableStringify(expected)) {
      notes.push(
        `位置 ${index}: ESLint=${JSON.stringify(expected)} / oxlint=${JSON.stringify(effective)}`,
      );
    }
  });

  if (notes.length === 0) {
    return { notes, verdict: 'equivalent' };
  }

  return { notes, verdict: unknown ? 'unknown' : 'differs' };
}

/**
 * @param {any} property A schema property node.
 *
 * @param {OptionSchema} schema The loaded option schema, used to follow `$ref`s.
 *
 * @returns {unknown} The declared default, or `undefined` when there is none.
 */
function defaultOf(property, schema) {
  return 'default' in property
    ? property.default
    : schema.resolve(property).default;
}

/**
 * @param {unknown} value A value to test.
 *
 * @returns {boolean} `true` for an option object, `false` for arrays and scalars.
 */
function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
