import { getOxlintConfig } from '../../utils/buildHelper.ts';

describe('nextjs', () => {
  it('should match oxlint config snapshot', () => {
    expect(getOxlintConfig(import.meta.dirname)).toMatchSnapshot();
  });
});
