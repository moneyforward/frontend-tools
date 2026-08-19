import { getOxlintConfig } from '../../../utils/buildHelper.ts';

describe('test react', () => {
  it('should match oxlint config snapshot', () => {
    expect(getOxlintConfig(import.meta.dirname)).toMatchSnapshot();
  });
});
