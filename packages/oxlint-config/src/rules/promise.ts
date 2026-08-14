import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['promise'],
  rules: {
    // Require returning inside each `then()` to create readable and reusable Promise chains.
    // In use cases that don't assume a return value, such as `React.Suspense`, this rule can be confusing.
    'promise/always-return': ['warn', { ignoreLastCallback: true }],
    'promise/avoid-new': ['off'],
    'promise/no-callback-in-promise': ['warn'],
    // Disallow nested `then()` or `catch()` statements.
    // Disallowing nesting may actually increase complexity.
    'promise/no-nesting': ['off'],
    'promise/no-promise-in-callback': ['warn'],
    'promise/no-return-in-finally': ['warn'],
    'promise/valid-params': ['warn'],
  },
});
