#!/usr/bin/env node

import {
  importConfigFromJsFile,
  resolveJsonOutputPath,
  rulesOutputDir,
  runGenerator,
  srcRulesDir,
  writeJsonFile,
} from './jsonGeneratorShared.js';

await runGenerator(
  srcRulesDir,
  async (ruleFilePath) => {
    const config = await importConfigFromJsFile(ruleFilePath);
    const outputPath = resolveJsonOutputPath(ruleFilePath, rulesOutputDir);

    return writeJsonFile(outputPath, config);
  },
  { allowEmpty: true },
);
