import { getESLintConfig } from '../../helper.mts';

describe('ESLint Configuration Snapshot Tests', () => {
  beforeAll(() => {
    process.env.TSCONFIG_ROOT_DIR = '/dummy';
  });

  test('should match ESLint Flat Configuration snapshot: jsdoc', async () => {
    const filePath = 'apps/dummy.js';
    const config = await getESLintConfig(filePath, import.meta.dirname);

    expect(config).toMatchSnapshot();
  });

  afterAll(() => {
    process.env.TSCONFIG_ROOT_DIR = undefined;
  });
});
