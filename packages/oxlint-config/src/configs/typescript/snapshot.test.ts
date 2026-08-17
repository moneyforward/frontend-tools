import { getOxlintConfig } from '../../utils/buildHelper.ts';

describe('typescript', () => {
  it('should match oxlint config snapshot', () => {
    expect(getOxlintConfig(import.meta.dirname)).toMatchSnapshot();
  });
});
