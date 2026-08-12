#!/usr/bin/env node

import path from 'node:path';
import {
  configsOutputDir,
  importConfigFromJsFile,
  packageRoot,
  resolveJsonOutputPath,
  resolveTargetJsFiles,
  rulesOutputDir,
  runGenerator,
  srcConfigsDir,
  srcRulesDir,
  writeJsonFile,
} from './jsonGeneratorShared.js';

/**
 * Maps each rule-set's default export to the absolute path of its generated
 * JSON preset.
 *
 * ESM module caching guarantees that the rule-set objects referenced in a
 * config's `extends` array are the same instances imported here, so the map
 * can be keyed by object identity.
 *
 * @returns {Promise<Map<unknown, string>>}
 */
async function buildRuleSetOutputMap() {
  const ruleFiles = await resolveTargetJsFiles(srcRulesDir, []);
  const entries = await Promise.all(
    ruleFiles.map(async (ruleFilePath) => {
      const ruleSet = await importConfigFromJsFile(ruleFilePath);
      const outputPath = resolveJsonOutputPath(ruleFilePath, rulesOutputDir);

      return [ruleSet, outputPath];
    }),
  );

  return new Map(entries);
}

/**
 * Rewrites a config's `extends` entries: string entries pass through, while
 * rule-set objects are replaced with the relative path to their generated JSON
 * preset.
 *
 * @param {unknown} extendsValue - The value of a config's `extends` property.
 * @param {Map<unknown, string>} ruleSetOutputMap - Maps rule-set objects to the absolute path of their generated JSON preset.
 * @param {string} configOutputPath - Absolute path of the config's generated JSON file.
 *
 * @returns {unknown} The normalized `extends` value.
 */
function normalizeExtends(extendsValue, ruleSetOutputMap, configOutputPath) {
  if (!Array.isArray(extendsValue)) {
    return extendsValue;
  }

  return extendsValue.map((entry) => {
    if (typeof entry === 'string') {
      return entry;
    }

    const ruleOutputPath = ruleSetOutputMap.get(entry);

    if (ruleOutputPath === undefined) {
      throw new Error(
        `Unable to map an extends entry to a generated rule preset in ${path.relative(packageRoot, configOutputPath)}`,
      );
    }

    return path.relative(path.dirname(configOutputPath), ruleOutputPath);
  });
}

const ruleSetOutputMap = await buildRuleSetOutputMap();

await runGenerator(
  srcConfigsDir,
  async (configFilePath) => {
    const config = await importConfigFromJsFile(configFilePath);
    const relativeConfigDirectory = path.relative(
      srcConfigsDir,
      path.dirname(configFilePath),
    );
    const outputPath = path.resolve(
      configsOutputDir,
      `${relativeConfigDirectory}.json`,
    );
    const normalizedConfig =
      'extends' in config
        ? {
            ...config,
            extends: normalizeExtends(
              config.extends,
              ruleSetOutputMap,
              outputPath,
            ),
          }
        : config;

    return writeJsonFile(outputPath, normalizedConfig);
  },
  {
    excludeRelativePaths: ['index.ts'],
    includeBaseNames: ['index'],
    recursive: true,
  },
);
