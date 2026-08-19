import { defineConfig } from 'oxlint';

export default defineConfig({
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
      plugins: ['vitest'],
      rules: {
        'vitest/consistent-test-filename': ['warn'],
        'vitest/expect-expect': ['warn'],
        'vitest/no-commented-out-tests': ['warn'],
        'vitest/no-disabled-tests': ['warn'],
        'vitest/no-hooks': ['warn'],
        'vitest/no-large-snapshots': ['warn'],
        'vitest/require-hook': ['off'],
        'vitest/require-top-level-describe': ['warn'],
        'vitest/prefer-called-times': ['off'],
        'vitest/prefer-expect-assertions': ['off'],
        'vitest/prefer-importing-vitest-globals': ['off'],
        'vitest/prefer-snapshot-hint': ['warn'],
        'vitest/prefer-strict-boolean-matchers': ['off'],
        'vitest/prefer-to-be-truthy': ['warn'],
        'vitest/require-test-timeout': ['off'],
        'vitest/valid-title': [
          'error',
          {
            allowArguments: false,
            ignoreTypeOfDescribeName: true,
          },
        ],
      },
    },
  ],
});
