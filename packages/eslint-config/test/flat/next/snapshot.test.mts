import { getESLintConfig } from '../../helper.mts';

test('should match ESLint Flat Configuration snapshot: next', async () => {
  const filePath = 'apps/dummy.page.tsx';
  const config = await getESLintConfig(filePath, import.meta.dirname);

  expect(config).toMatchSnapshot();
});
