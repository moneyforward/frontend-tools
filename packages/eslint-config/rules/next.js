module.exports = {
  plugins: ['@next/next'],
  extends: [
    // This config includes `plugin:@next/next/recommended-legacy`.
    // Since v16, the eslintrc format configs are exposed with the `-legacy` suffix,
    // while `recommended` / `core-web-vitals` are flat configs.
    // https://github.com/vercel/next.js/blob/v16.3.0/packages/eslint-plugin-next/src/index.ts
    'plugin:@next/next/core-web-vitals-legacy',
  ],

  overrides: [
    {
      files: ['**/@(app|pages)/**/*', '*.page.@(tsx|jsx|js)'],
      rules: {
        'import/no-default-export': ['off'],
      },
    },
  ],
};
