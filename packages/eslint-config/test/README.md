# ESLint Snapshot Test

This repository contains a snapshot test for verifying the integrity of the ESLint Configuration. Snapshot testing is a technique used to capture the state of a system at a particular point in time. The snapshot is then used as a benchmark for future tests.

In the context of ESLint, we use snapshot testing to ensure that our configuration remains consistent and any changes are intentional. If a change is made to the ESLint configuration, the snapshot test will fail, indicating that the configuration has been altered. To pass the test, the snapshot must be updated to reflect the intended changes.

To run the snapshot test, use the following command:

```bash
pnpm test
```

If the test fails, and the changes to the ESLint configuration are intentional, you can update the snapshot using the following command:

```bash
pnpm test -u
```

This will update the snapshot to match the current configuration. The updated snapshot should then be committed along with the changes to the ESLint configuration.

Please note that snapshot tests are not a replacement for thorough testing. They should be used as part of a comprehensive testing strategy.

## References

- [Node.js API Reference - ESLint - Pluggable JavaScript Linter](https://eslint.org/docs/latest/integrate/nodejs-api)
- [ESLintの設定をスナップショットテストしてみよう - Chatwork Creator's Note](https://creators-note.chatwork.com/entry/2021/02/12/160808)
