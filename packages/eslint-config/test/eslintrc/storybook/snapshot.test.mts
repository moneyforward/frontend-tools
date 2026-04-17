import { getESLintConfig } from '../../helper.mts';

test('should match ESLint configuration snapshot: storybook', async () => {
  const filePath = 'dummy.stories.tsx';
  const config = await getESLintConfig(filePath, import.meta.dirname, false);

  expect(config).toMatchSnapshot();
});
