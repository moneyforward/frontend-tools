/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  extends: 'semantic-release-monorepo',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'docs', scope: 'README', release: 'patch' },
          { type: 'docs', scope: 'LICENSE', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',

        // Override the conventional-changelog preset to accommodate the `releaseRules` you added to the `@semantic-release/commit-analyzer` plugin options.
        // see: https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.2.0/README.md#types
        presetConfig: {
          // origin preset: https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-conventionalcommits/src/constants.js
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'feature', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'revert', section: 'Reverts' },

            // Override the configuration to include `docs` type in the release notes.
            { type: 'docs', scope: 'README', section: 'Documentation' },
            { type: 'docs', scope: 'LICENSE', section: 'Documentation' },

            { type: 'style', section: 'Styles', hidden: true },
            { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
            { type: 'refactor', section: 'Code Refactoring', hidden: true },
            { type: 'test', section: 'Tests', hidden: true },
            { type: 'build', section: 'Build System', hidden: true },
            { type: 'ci', section: 'Continuous Integration', hidden: true },
          ],
        },
      },
    ],
    '@semantic-release/changelog',
    '@semantic-release/npm',

    // `@semantic-release/git` is intentionally omitted: the organization ruleset on the default branch
    // requires every change to go through a pull request, so committing back to `main` is rejected.
    // The release workflow opens a pull request with the generated `CHANGELOG.md` / `package.json` instead.
    '@semantic-release/github',
  ],
};
