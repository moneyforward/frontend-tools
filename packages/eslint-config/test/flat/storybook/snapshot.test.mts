import { getESLintConfig } from '../../helper.mts';

test('should match ESLint Flat Configuration snapshot: storybook', async () => {
  const filePath = 'dummy.stories.tsx';
  const config = await getESLintConfig(filePath, import.meta.dirname);

  expect(config).toMatchSnapshot();
});
