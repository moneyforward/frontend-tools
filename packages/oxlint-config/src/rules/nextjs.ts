import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['nextjs'],
  rules: {
    'nextjs/google-font-display': ['warn'],
    'nextjs/google-font-preconnect': ['warn'],
    'nextjs/next-script-for-ga': ['warn'],
    'nextjs/no-async-client-component': ['warn'],
    'nextjs/no-before-interactive-script-outside-document': ['warn'],
    'nextjs/no-css-tags': ['warn'],
    'nextjs/no-head-element': ['warn'],
    'nextjs/no-img-element': ['warn'],
    'nextjs/no-page-custom-font': ['warn'],
    'nextjs/no-styled-jsx-in-document': ['warn'],
    'nextjs/no-title-in-document-head': ['warn'],
    'nextjs/no-typos': ['warn'],
    'nextjs/no-unwanted-polyfillio': ['warn'],
  },
  overrides: [
    {
      files: ['**/{app,pages}/**/*', '**/*.page.{tsx,jsx,js}'],
      rules: {
        'import/no-default-export': ['off'],
        'react/only-export-components': ['off'],
      },
    },
  ],
});
