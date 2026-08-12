import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves the resolved oxlint configuration for a given directory.
 *
 * oxlint exposes no Node.js API for resolving configuration, so this shells out
 * to `oxlint --print-config`. The working directory determines which
 * `oxlint.config.ts` is picked up.
 *
 * @param cwd Absolute path to a directory that contains an `oxlint.config.ts`.
 *
 * @returns The resolved oxlint configuration as a plain object.
 */
export function getOxlintConfig(cwd: string): unknown {
  const oxlintEntry = fileURLToPath(import.meta.resolve('oxlint'));
  const oxlintBin = path.resolve(
    path.dirname(oxlintEntry),
    '..',
    'bin',
    'oxlint',
  );

  const stdout = execFileSync(oxlintBin, ['--print-config'], {
    cwd,
    encoding: 'utf8',
  });

  return JSON.parse(stdout) as unknown;
}
