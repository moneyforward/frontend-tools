// @ts-check

/**
 * Reads values out of Vitest snapshot files.
 *
 * Vitest serialises snapshots with `pretty-format`, which does not escape double
 * quotes inside strings (for example `"input[type="image"]"`), so a snapshot body
 * is not valid JSON. The parser here relies on `pretty-format`'s deterministic
 * layout instead — two space indentation, trailing commas, one value per line —
 * and never evaluates the file.
 */

import fs from 'node:fs';

import { ComparisonError } from './util.mjs';

/**
 * Reads one or more top-level sections out of a Vitest snapshot file.
 *
 * @param {string} file Absolute path to a `*.snap` file.
 *
 * @param {string} label Human readable side name used in error messages.
 *
 * @param {string[]} keys Top-level keys to extract. A key that is absent yields
 * `undefined`, except `rules`, whose absence means the snapshot is unusable.
 *
 * @returns {Record<string, any>} The extracted sections, keyed by `keys`.
 */
export function readSections(file, label, keys) {
  const body = extractSnapshotBody(file, label);
  /** @type {Record<string, any>} */
  const sections = {};

  for (const key of keys) {
    // Anchored to the root object's two space indentation so that a nested
    // `rules` block (oxlint's `overrides[]`, ESLint's `settings`) is not picked
    // up instead of the resolved top-level one.
    const start = body.findIndex((line) =>
      new RegExp(`^ {2}"${escapeRegExp(key)}": [[{]$`).test(line),
    );

    if (start < 0) {
      if (key === 'rules') {
        throw new ComparisonError(
          `${label} 側 snapshot に "rules" セクションが見つかりません: ${file}`,
        );
      }

      sections[key] = undefined;
      continue;
    }

    sections[key] = parseContainer(body, start, file, label).value;
  }

  return sections;
}

/**
 * Extracts the serialised body of the first snapshot entry in a `*.snap` file
 * and undoes the template literal escaping Vitest applies when writing it.
 *
 * @param {string} file Absolute path to a `*.snap` file.
 *
 * @param {string} label Human readable side name used in error messages.
 *
 * @returns {string[]} The snapshot body, line by line.
 */
function extractSnapshotBody(file, label) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const inline = /^exports\[`.*`\] = `(.*)`;$/.exec(lines[index]);

    if (inline) {
      throw new ComparisonError(
        [
          `${label} 側 snapshot の値が \`${inline[1]}\` になっています: ${file}`,
          'snapshot テストが設定を解決できていない可能性があります（対象ファイルパスが config の files パターンに一致していない等）。テスト側を修正してから再実行してください。',
        ].join('\n'),
      );
    }

    if (!/^exports\[`.*`\] = `$/.test(lines[index])) {
      continue;
    }

    const body = [];

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (lines[cursor] === '`;') {
        return body;
      }

      body.push(unescapeSnapshotLine(lines[cursor]));
    }
  }

  throw new ComparisonError(
    `${label} 側 snapshot エントリを解析できませんでした: ${file}`,
  );
}

/**
 * Reverses Vitest's `escapeBacktickString`, which prefixes a backslash to
 * backticks, backslashes, and `${`.
 *
 * @param {string} line A raw snapshot line.
 *
 * @returns {string} The unescaped line.
 */
function unescapeSnapshotLine(line) {
  return line.replace(/\\(.)/g, '$1');
}

/**
 * Parses the object or array that starts on `body[start]`.
 *
 * @param {string[]} body The snapshot body.
 *
 * @param {number} start Index of the line that opens the container.
 *
 * @param {string} file Snapshot path, used in error messages.
 *
 * @param {string} label Human readable side name used in error messages.
 *
 * @returns {{next: number, value: any}} The parsed container and the index of
 * the line after it.
 */
function parseContainer(body, start, file, label) {
  const opener = body[start].trimEnd().slice(-1);

  return opener === '['
    ? parseArray(body, start + 1, file, label)
    : parseObject(body, start + 1, file, label);
}

/**
 * @param {string[]} body The snapshot body.
 *
 * @param {number} start Index of the first line inside the object.
 *
 * @param {string} file Snapshot path, used in error messages.
 *
 * @param {string} label Human readable side name used in error messages.
 *
 * @returns {{next: number, value: Record<string, any>}} The parsed object.
 */
function parseObject(body, start, file, label) {
  /** @type {Record<string, any>} */
  const value = {};
  let cursor = start;

  while (cursor < body.length) {
    const trimmed = body[cursor].trim();

    if (trimmed === '}' || trimmed === '},') {
      return { next: cursor + 1, value };
    }

    // The key is delimited by the *last* `": ` on the line, because
    // `pretty-format` leaves quotes inside keys unescaped.
    const entry = /^\s*"(.*)": (.*)$/.exec(body[cursor]);

    if (!entry) {
      throw new ComparisonError(
        `${label} 側 snapshot の ${cursor + 1} 行目を解析できませんでした: ${file}\n  ${body[cursor]}`,
      );
    }

    const [, key, rest] = entry;

    if (rest === '{' || rest === '[') {
      const parsed = parseContainer(body, cursor, file, label);

      value[key] = parsed.value;
      cursor = parsed.next;
      continue;
    }

    const scalar = parseScalar(body, cursor);

    value[key] = scalar.value;
    cursor = scalar.next;
  }

  throw new ComparisonError(
    `${label} 側 snapshot のオブジェクトが閉じられていません: ${file}`,
  );
}

/**
 * @param {string[]} body The snapshot body.
 *
 * @param {number} start Index of the first line inside the array.
 *
 * @param {string} file Snapshot path, used in error messages.
 *
 * @param {string} label Human readable side name used in error messages.
 *
 * @returns {{next: number, value: any[]}} The parsed array.
 */
function parseArray(body, start, file, label) {
  /** @type {any[]} */
  const value = [];
  let cursor = start;

  while (cursor < body.length) {
    const trimmed = body[cursor].trim();

    if (trimmed === ']' || trimmed === '],') {
      return { next: cursor + 1, value };
    }

    if (trimmed === '{' || trimmed === '[') {
      const parsed = parseContainer(body, cursor, file, label);

      value.push(parsed.value);
      cursor = parsed.next;
      continue;
    }

    const scalar = parseScalar(body, cursor);

    value.push(scalar.value);
    cursor = scalar.next;
  }

  throw new ComparisonError(
    `${label} 側 snapshot の配列が閉じられていません: ${file}`,
  );
}

/**
 * Parses a scalar value, joining continuation lines when `pretty-format` printed
 * a string that contains newlines.
 *
 * @param {string[]} body The snapshot body.
 *
 * @param {number} start Index of the line that holds the value.
 *
 * @returns {{next: number, value: unknown}} The parsed value.
 */
function parseScalar(body, start) {
  const entry = /^\s*"(?:.*)": (.*)$/.exec(body[start]);
  let raw = entry ? entry[1] : body[start].trim();
  let cursor = start;

  while (isUnterminatedString(raw) && cursor + 1 < body.length) {
    cursor += 1;
    raw = `${raw}\n${body[cursor]}`;
  }

  const trimmedRaw = raw.endsWith(',') ? raw.slice(0, -1) : raw;

  if (trimmedRaw.startsWith('"') && trimmedRaw.endsWith('"')) {
    return { next: cursor + 1, value: trimmedRaw.slice(1, -1) };
  }

  if (trimmedRaw === 'true' || trimmedRaw === 'false') {
    return { next: cursor + 1, value: trimmedRaw === 'true' };
  }

  if (
    trimmedRaw === 'null' ||
    trimmedRaw === 'undefined' ||
    trimmedRaw === '[Function anonymous]'
  ) {
    return { next: cursor + 1, value: null };
  }

  if (trimmedRaw === '{}' || trimmedRaw === '[]') {
    return { next: cursor + 1, value: trimmedRaw === '{}' ? {} : [] };
  }

  if (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(trimmedRaw)) {
    return { next: cursor + 1, value: Number(trimmedRaw) };
  }

  return { next: cursor + 1, value: trimmedRaw };
}

/**
 * Detects a value that `pretty-format` printed as a string containing newlines,
 * which spans several snapshot lines.
 *
 * @param {string} raw The raw value collected so far.
 *
 * @returns {boolean} `true` while the closing quote has not been reached.
 */
function isUnterminatedString(raw) {
  return raw.startsWith('"') && !(raw.length > 1 && /"[,]?$/.test(raw));
}

/**
 * @param {string} value A literal to embed in a regular expression.
 *
 * @returns {string} The escaped literal.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
