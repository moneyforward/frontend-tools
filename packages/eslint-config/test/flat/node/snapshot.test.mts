import { getESLintConfig } from '../../helper.mts';

test('should match ESLint Flat Configuration snapshot: node', async () => {
  const filePath = './dummy.js';
  const config = await getESLintConfig(filePath, import.meta.dirname);

  expect(config).toMatchSnapshot();
});
