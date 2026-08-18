import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: jsdoc', async () => {
  const filePath = 'dummy.js';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect({ ...config, parser: undefined }).toMatchSnapshot();
});
