import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: next', async () => {
  const filePath = 'apps/dummy.page.tsx';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect({ ...config, parser: undefined }).toMatchSnapshot();
});
