import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: react', async () => {
  const filePath = 'dummy.tsx';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect({ ...config, parser: undefined }).toMatchSnapshot();
});
