import { getOxlintConfig } from '../../utils/buildHelper.ts';

describe('essentials', () => {
  it('should match oxlint config snapshot', () => {
    expect(getOxlintConfig(import.meta.dirname)).toMatchSnapshot();
  });
});
