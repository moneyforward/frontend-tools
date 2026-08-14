// @ts-check

import { truncate } from './util.mjs';

/**
 * Renders the comparison as the Markdown report that gets saved under
 * `packages/oxlint-config/docs/mapping/`.
 *
 * @param {Record<string, any>} meta Report metadata.
 *
 * @param {Record<string, any[]>} result Classified rules.
 *
 * @param {{verbose: boolean}} options Rendering options.
 *
 * @returns {string} The Markdown report.
 */
export function renderMarkdown(meta, result, options) {
  return `${[
    `# ルールマッピング比較: ${meta.granularity}`,
    '',
    ...targetSection(meta),
    ...summarySection(result),
    ...ruleSections(result),
    ...optionSections(meta, result),
    ...matchedSection(result, options),
  ].join('\n')}\n`;
}

/**
 * @param {Record<string, any>} meta Report metadata.
 *
 * @returns {string[]} The rendered lines.
 */
function targetSection(meta) {
  const lines = [
    '## 対象',
    '',
    `- ESLint snapshot: \`${meta.eslintSnapshot}\`（${meta.eslintRuleCount} ルール）`,
    `- oxlint snapshot: \`${meta.oxlintSnapshot}\`（${meta.oxlintRuleCount} ルール）`,
    `- ESLint 側構成: \`${meta.eslintComposition}\``,
    `- oxlint 側構成: \`extends: ${meta.oxlintComposition}\``,
    `- oxlint 有効プラグイン: ${
      meta.oxlintPlugins.length > 0
        ? meta.oxlintPlugins.map((name) => `\`${name}\``).join(', ')
        : '(なし)'
    }`,
    '',
  ];

  if (meta.warnings.length > 0) {
    lines.push(
      '> [!WARNING]',
      ...meta.warnings.map((warning) => `> ${warning}`),
      '',
    );
  }

  return lines;
}

/**
 * @param {Record<string, any[]>} result Classified rules.
 *
 * @returns {string[]} The rendered lines.
 */
function summarySection(result) {
  const byVerdict = (verdict) =>
    result.optionsDiff.filter((entry) => entry.verdict === verdict).length;

  return [
    '## サマリ',
    '',
    '| 区分 | 件数 |',
    '| --- | --- |',
    `| ✅ マッピング済み | ${result.matched.length} |`,
    `| ❌ oxlint 側で未設定（oxlint はサポート済み） | ${result.missingInOxlint.length} |`,
    `| 🚫 oxlint 未サポート | ${result.unsupported.length} |`,
    `| ⚠️ 重大度の相違 | ${result.severityDiff.length} |`,
    `| ➕ oxlint 側のみ有効 | ${result.oxlintOnly.length} |`,
    `| ➕ ESLint で off だが oxlint で有効 | ${result.eslintIntentionallyOff.length} |`,
    `| オプション差異 | ${result.optionsDiff.length}（要対応 ${byVerdict('differs')} / 判定不能 ${byVerdict('unknown')} / 実質一致 ${byVerdict('equivalent')}） |`,
    `| 両側とも無効 | ${result.bothOff.length} |`,
    '',
  ];
}

/**
 * @param {Record<string, any[]>} result Classified rules.
 *
 * @returns {string[]} The rendered lines.
 */
function ruleSections(result) {
  return [
    ...section(
      '## ❌ oxlint 側で未設定（oxlint はサポート済み → 要対応）',
      result.missingInOxlint,
      [
        'ESLint ルール',
        'oxlint ルール',
        'ESLint 重大度',
        'category',
        'type-aware',
        'plugin',
      ],
      (entry) => [
        ruleList(entry.eslintNames),
        `\`${entry.canonical}\``,
        entry.eslintSeverity,
        entry.category,
        entry.typeAware ? 'yes' : 'no',
        entry.pluginEnabled ? '有効' : `**未有効 (${entry.scope})**`,
      ],
    ),
    ...unsupportedSection(result.unsupported),
    ...section(
      '## ⚠️ 重大度の相違',
      result.severityDiff,
      ['ESLint ルール', 'oxlint ルール', 'ESLint', 'oxlint'],
      (entry) => [
        ruleList(entry.eslintNames),
        `\`${entry.canonical}\``,
        entry.eslintSeverity,
        entry.oxlintSeverity,
      ],
    ),
    ...section(
      '## ➕ ESLint で意図的に off だが oxlint で有効（過剰の可能性）',
      result.eslintIntentionallyOff,
      ['ESLint ルール', 'oxlint ルール', 'oxlint 重大度'],
      (entry) => [
        ruleList(entry.eslintNames),
        `\`${entry.canonical}\``,
        entry.oxlintSeverity,
      ],
    ),
    ...section(
      '## ➕ oxlint 側のみ有効（ESLint に対応ルールなし）',
      result.oxlintOnly,
      ['oxlint ルール', 'scope', 'category', '重大度'],
      (entry) => [
        `\`${entry.canonical}\``,
        entry.scope,
        entry.category,
        entry.oxlintSeverity,
      ],
    ),
  ];
}

/**
 * Groups the unsupported rules by ESLint plugin, because a whole plugin missing
 * from oxlint reads very differently from a single rule missing.
 *
 * @param {any[]} unsupported The unsupported rules.
 *
 * @returns {string[]} The rendered lines.
 */
function unsupportedSection(unsupported) {
  const lines = ['## 🚫 oxlint 未サポート（やむを得ない差分）', ''];

  if (unsupported.length === 0) {
    return [...lines, '該当なし。', ''];
  }

  /** @type {Map<string, any[]>} */
  const groups = new Map();

  for (const entry of unsupported) {
    groups.set(entry.plugin, [...(groups.get(entry.plugin) ?? []), entry]);
  }

  for (const [plugin, entries] of [...groups].sort((left, right) =>
    left[0].localeCompare(right[0]),
  )) {
    lines.push(
      ...section(
        `### ${plugin}（${entries.length} 件）`,
        entries,
        ['ESLint ルール', 'ESLint 重大度', '類似候補'],
        (entry) => [
          ruleList(entry.eslintNames),
          entry.eslintSeverity,
          entry.similar.length > 0 ? ruleList(entry.similar) : '-',
        ],
      ),
    );
  }

  return lines;
}

/**
 * Renders the option comparison, split by how conclusive each difference is.
 *
 * @param {Record<string, any>} meta Report metadata.
 *
 * @param {Record<string, any[]>} result Classified rules.
 *
 * @returns {string[]} The rendered lines.
 */
function optionSections(meta, result) {
  const lines = ['## オプション指定の差異', ''];

  if (meta.authoredOptionsErrors.length > 0) {
    return [
      ...lines,
      `設定ソースを読み込めなかったため判定できません（${meta.authoredOptionsErrors.join(' / ')}）。`,
      '',
    ];
  }

  const byVerdict = (verdict) =>
    result.optionsDiff.filter((entry) => entry.verdict === verdict);
  const toRow = (entry) => [
    `\`${entry.canonical}\``,
    `\`${truncate(JSON.stringify(entry.eslintOptions), 70)}\``,
    entry.notes.join('<br>'),
  ];
  const equivalent = byVerdict('equivalent');

  return [
    ...lines,
    'オプションは snapshot ではなく両側の設定ソース（`eslint.config.mjs` / `oxlint.config.ts`）から読み取り、oxlint 側の実効値は「rule set に書かれた値、無ければ `configuration_schema.json` の既定値」として突き合わせています。ESLint の解決済み設定はスキーマ既定値も埋めてしまい、oxlint は object 形式の `extends` を使うと `--print-config` からオプションを落とすため（[oxc#22230](https://github.com/oxc-project/oxc/issues/22230)、実行時の挙動には影響しない）、いずれの snapshot からも実際の指定は判定できません。',
    '',
    ...section(
      '### 要対応: 実効値が異なる',
      byVerdict('differs'),
      ['ルール', 'ESLint options', '差分'],
      toRow,
    ),
    ...section(
      '### 判定不能: oxlint の既定値が不明',
      byVerdict('unknown'),
      ['ルール', 'ESLint options', '理由'],
      toRow,
      'oxlint のドキュメントで既定値を確認する必要があります。',
    ),
    `### 実質一致: oxlint の既定値と同じ（${equivalent.length} 件）`,
    '',
    equivalent.length > 0
      ? `対応不要です: ${ruleList(equivalent.map((entry) => entry.canonical))}`
      : '該当なし。',
    '',
  ];
}

/**
 * @param {Record<string, any[]>} result Classified rules.
 *
 * @param {{verbose: boolean}} options Rendering options.
 *
 * @returns {string[]} The rendered lines.
 */
function matchedSection(result, options) {
  const lines = [`## ✅ マッピング済み（${result.matched.length} 件）`, ''];

  if (!options.verbose) {
    return [...lines, '`--verbose` を付けると一覧を出力します。', ''];
  }

  return [
    ...lines,
    '| ESLint ルール | oxlint ルール | 重大度 |',
    '| --- | --- | --- |',
    ...result.matched.map(
      (entry) =>
        `| ${ruleList(entry.eslintNames)} | \`${entry.canonical}\` | ${entry.eslintSeverity} |`,
    ),
    '',
  ];
}

/**
 * @param {string} heading The section heading.
 *
 * @param {any[]} entries The rows to render.
 *
 * @param {string[]} headers Table headers.
 *
 * @param {(entry: any) => string[]} toCells Maps an entry to table cells.
 *
 * @param {string} [note] An optional note rendered under the heading.
 *
 * @returns {string[]} The rendered lines.
 */
function section(heading, entries, headers, toCells, note) {
  const lines = [heading, '', ...(note ? [note, ''] : [])];

  if (entries.length === 0) {
    return [...lines, '該当なし。', ''];
  }

  return [
    ...lines,
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...entries.map((entry) => `| ${toCells(entry).join(' | ')} |`),
    '',
  ];
}

/**
 * @param {string[]} rules Rule names.
 *
 * @returns {string} The names as an inline code list.
 */
function ruleList(rules) {
  return rules.map((rule) => `\`${rule}\``).join(', ');
}
