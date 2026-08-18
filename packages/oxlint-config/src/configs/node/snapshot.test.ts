import { getOxlintConfig } from '../../utils/buildHelper.ts';

describe('node', () => {
  it('should match oxlint config snapshot', () => {
    expect(getOxlintConfig(import.meta.dirname)).toMatchSnapshot();
  });
});
