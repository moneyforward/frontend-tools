import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['oxc'],
  rules: {
    'oxc/no-accumulating-spread': ['off'],
    'oxc/no-async-await': ['off'],
    'oxc/no-map-spread': ['off'],
    'oxc/no-optional-chaining': ['off'],
    'oxc/no-rest-spread-properties': ['off'],
  },
});
