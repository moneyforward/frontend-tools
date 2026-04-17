import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: node', async () => {
  const filePath = './dummy.js';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect(config).toMatchSnapshot();
});
