---
description: Compare the eslint-config and oxlint-config snapshot test results, then list the rule mapping status, the differences, and what oxlint does not support
argument-hint: <granularity> (essentials | typescript | nextjs | node | react | storybook | test.essentials | test.react)
---

Use the `compare-lint-rules` skill to compare how far the rule sets of `eslint-config-moneyforward` and `oxlint-config-moneyforward` map to each other.

Granularity to compare: $ARGUMENTS

When no granularity is given, offer `essentials` / `typescript` / `nextjs` / `node` / `react` / `storybook` / `test.essentials` / `test.react` and ask which one to compare. Do not batch several of them on your own.
