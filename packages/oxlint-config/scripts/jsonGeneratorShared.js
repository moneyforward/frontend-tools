import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const scriptDir = import.meta.dirname;

/**
 * Absolute path to the oxlint-config package root.
 */
export const packageRoot = path.resolve(scriptDir, '..');

/**
 * Source directory for internal rule-set implementations.
 */
export const srcRulesDir = path.resolve(packageRoot, 'src/rules');

/**
 * Output directory for generated rule JSON presets.
 */
export const rulesOutputDir = path.resolve(packageRoot, 'dist/rules');

/**
 * Source directory for internal config implementations.
 */
export const srcConfigsDir = path.resolve(packageRoot, 'src/configs');

/**
 * Output directory for generated config JSON presets.
 */
export const configsOutputDir = path.resolve(packageRoot, 'dist/configs');

const schemaAbsolutePath = path.resolve(
  packageRoot,
  'node_modules/oxlint/configuration_schema.json',
);

/**
 * @typedef {Object} ResolveTargetOptions
 * @property {string[]} [excludeBaseNames] Excludes source files whose basename,
 * without the `.ts` extension, matches an entry.
 * @property {string[]} [excludeRelativePaths] Excludes source files whose path
 * relative to `sourceDir` matches an entry; config generation uses this to
 * exclude the root `src/configs/index.ts` barrel file.
 * @property {string[]} [includeBaseNames] Limits source files to those whose
 * basename, without the `.ts` extension, matches an entry; config generation
 * uses this to select each config directory's `index.ts` entrypoint.
 * @property {boolean} [recursive] Searches descendant directories of
 * `sourceDir` when `true`.
 */

/**
 * @typedef {ResolveTargetOptions & { allowEmpty?: boolean }} RunGeneratorOptions
 * `allowEmpty` reports "nothing to generate" as a skip instead of a failure;
 * rule generation uses this because `src/rules` holds no source files until the
 * first rule-set lands.
 */

/**
 * Reads directory entries, treating a missing directory as empty.
 *
 * `src/rules` and `src/configs` fill up as presets land, so a directory that
 * does not exist yet is a valid "nothing to generate" state rather than a
 * failure.
 *
 * @param {string} dirPath Directory to read.
 *
 * @param {Parameters<typeof readdir>[1]} [options] Forwarded to `readdir`.
 *
 * @returns Directory entries, or an empty array when `dirPath` does not exist.
 */
async function readDirIfExists(dirPath, options) {
  try {
    return await readdir(dirPath, options);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function collectJsFilesRecursively(dirPath) {
  const entries = await readDirIfExists(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    // oxlint-disable-next-line typescript/require-await
    entries.map(async (entry) => {
      const absolutePath = path.resolve(dirPath, entry.name);

      if (entry.isDirectory()) {
        return collectJsFilesRecursively(absolutePath);
      }

      if (entry.isFile() && entry.name.endsWith('.ts')) {
        return [absolutePath];
      }

      return [];
    }),
  );

  return nested.flat();
}

/**
 * Resolves target JavaScript files from CLI args or by scanning a source directory.
 *
 * @param {string} sourceDir Directory that contains source JavaScript files.
 *
 * @param {string[]} inputArgs CLI arguments used to narrow generation targets.
 *
 * @param {ResolveTargetOptions} [options] Additional filters for resolving targets.
 *
 * `options.recursive` scans child directories as well.
 *
 * @returns Absolute paths of target JavaScript files.
 */
export async function resolveTargetJsFiles(sourceDir, inputArgs, options = {}) {
  const excludeSet = new Set(options.excludeBaseNames);
  const excludeRelativePathSet = new Set(options.excludeRelativePaths);
  const includeSet =
    options.includeBaseNames === undefined
      ? undefined
      : new Set(options.includeBaseNames);

  if (inputArgs.length === 0) {
    const targets =
      options.recursive === true
        ? await collectJsFilesRecursively(sourceDir)
        : await (async () => {
            const entries = await readDirIfExists(sourceDir);
            return entries
              .filter((entry) => entry.endsWith('.ts'))
              .map((entry) => path.resolve(sourceDir, entry));
          })();

    return targets.filter((target) => {
      const baseName = path.basename(target, '.ts');
      const relativePath = path.relative(sourceDir, target);

      return (
        !excludeSet.has(baseName) &&
        !excludeRelativePathSet.has(relativePath) &&
        (includeSet === undefined || includeSet.has(baseName))
      );
    });
  }

  return inputArgs
    .map((target) => (target.endsWith('.ts') ? target : `${target}.ts`))
    .map((target) =>
      path.isAbsolute(target) ? target : path.resolve(sourceDir, target),
    )
    .filter((target) => {
      const baseName = path.basename(target, '.ts');
      const relativePath = path.relative(sourceDir, target);

      return (
        !excludeSet.has(baseName) &&
        !excludeRelativePathSet.has(relativePath) &&
        (includeSet === undefined || includeSet.has(baseName))
      );
    });
}

/**
 * Imports a JavaScript config file and returns its default export.
 *
 * @param {string} filePath Absolute path to a JavaScript module.
 *
 * @returns Default-exported config object from the module.
 */
export async function importConfigFromJsFile(filePath) {
  const moduleUrl = pathToFileURL(filePath).href;
  const loadedModule = await import(moduleUrl);
  const config = loadedModule.default;

  if (config === null || typeof config !== 'object') {
    throw new TypeError(`Default export is not a config object: ${filePath}`);
  }

  return config;
}

/**
 * Resolves the output JSON path for a source JavaScript file.
 *
 * @param {string} sourceFilePath Source JavaScript file path.
 *
 * @param {string} outputDir Directory where the JSON file is written.
 *
 * @param {string} [sourceBaseDir] Optional base directory used to preserve nested structure.
 *
 * @returns {string} Absolute output path for the generated JSON file.
 */
export function resolveJsonOutputPath(
  sourceFilePath,
  outputDir,
  sourceBaseDir,
) {
  const relativeSourcePath =
    sourceBaseDir === undefined
      ? path.basename(sourceFilePath)
      : path.relative(sourceBaseDir, sourceFilePath);
  const outputRelativePath = relativeSourcePath.replace(/\.ts$/, '.json');

  return path.resolve(outputDir, outputRelativePath);
}

/**
 * Resolves the `$schema` relative path for a generated JSON file.
 *
 * @param {string} outputPath Absolute path to the generated JSON file.
 *
 * @returns {string} Relative path from the JSON location to the oxlint schema.
 */
function resolveSchemaPathForJson(outputPath) {
  return path.relative(path.dirname(outputPath), schemaAbsolutePath);
}

/**
 * Writes a generated JSON preset, injecting `$schema` as the first key.
 *
 * @param {string} outputPath Absolute path the JSON file is written to.
 *
 * @param {Record<string, unknown>} config Config object serialized after the `$schema` key.
 *
 * @returns {Promise<string>} Relative path from the package root to the generated JSON file.
 */
export async function writeJsonFile(outputPath, config) {
  const output = {
    $schema: resolveSchemaPathForJson(outputPath),
    ...config,
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  return path.relative(packageRoot, outputPath);
}

/**
 * Runs a JSON generator: resolves target files (optionally narrowed by CLI
 * args), generates each, logs the results, and reports failures via the
 * process exit code.
 *
 * @param {string} sourceDir Directory scanned for source JavaScript files.
 *
 * @param {function(string): Promise<string>} generate Produces a generated JSON file from a source path and
 * returns its package-relative path for logging.
 *
 * @param {RunGeneratorOptions} options Forwarded to {@link resolveTargetJsFiles}.
 *
 * @returns {Promise<void>} Resolves when all targets have been processed.
 */
export async function runGenerator(sourceDir, generate, options = {}) {
  try {
    const targetArgs = process.argv.slice(2);
    const sourceFiles = await resolveTargetJsFiles(
      sourceDir,
      targetArgs,
      options,
    );

    if (sourceFiles.length === 0) {
      if (options.allowEmpty === true) {
        console.info(
          `Skipped: no source files were found in ${path.relative(packageRoot, sourceDir)}`,
        );

        return;
      }

      throw new Error(`No source files were found in ${sourceDir}`);
    }

    const generatedFiles = await Promise.all(sourceFiles.map(generate));
    generatedFiles.forEach((file) => {
      console.info(`Generated: ${file}`);
    });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
