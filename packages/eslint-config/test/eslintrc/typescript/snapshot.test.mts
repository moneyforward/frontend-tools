import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: typescript', async () => {
  const filePath = 'apps/dummy.ts';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect({ ...config, parser: undefined }).toMatchSnapshot();
});
