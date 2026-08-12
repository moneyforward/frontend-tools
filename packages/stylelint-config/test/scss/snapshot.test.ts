import path from 'node:path';
import stylelint from 'stylelint';

test('should match Stylelint Configuration snapshot: css', async () => {
  const { rules } =
    (await stylelint.resolveConfig(
      path.resolve(import.meta.dirname, './stylelint.config.js'),
    )) ?? {};

  expect({ rules }).toMatchSnapshot();
});
