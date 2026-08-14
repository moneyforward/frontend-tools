// @ts-check

import fs from 'node:fs';
import path from 'node:path';

/**
 * Signals a condition the user has to resolve (a missing snapshot, an
 * unparsable file, a missing oxlint binary). The CLI turns this into a message
 * on stderr and a non-zero exit code, so nothing below the CLI layer needs to
 * call `process.exit`.
 */
export class ComparisonError extends Error {
  /**
   * @param {string} message The message shown to the user.
   *
   * @param {{showUsage?: boolean}} [options] Set `showUsage` when the message is
   * about how the command was invoked, so the CLI appends its usage text.
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'ComparisonError';
    this.showUsage = options.showUsage ?? false;
  }
}

/**
 * Serialises a value with object keys sorted, so that two option objects that
 * differ only in property order compare as equal.
 *
 * @param {unknown} value The value to serialise.
 *
 * @returns {string} A key-order independent JSON string.
 */
export function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value) ?? 'null';
}

/**
 * @param {string} value A value to shorten for table display.
 *
 * @param {number} [max] The maximum length.
 *
 * @returns {string} The shortened value.
 */
export function truncate(value, max = 120) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/**
 * @param {string} target A file or directory path.
 *
 * @returns {number} The newest modification time in milliseconds, or 0 when the
 * path does not exist.
 */
export function newestMtime(target) {
  if (!fs.existsSync(target)) {
    return 0;
  }

  const stats = fs.statSync(target);

  if (!stats.isDirectory()) {
    return stats.mtimeMs;
  }

  return fs
    .readdirSync(target)
    .filter((entry) => entry !== 'node_modules' && entry !== '__snapshots__')
    .reduce(
      (newest, entry) =>
        Math.max(newest, newestMtime(path.join(target, entry))),
      stats.mtimeMs,
    );
}
