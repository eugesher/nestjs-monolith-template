import { EnvHelper } from '../env.helper';

describe('EnvHelper', () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = process.env;
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = env;
  });

  describe('isProduction', () => {
    it('is true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';

      const production = EnvHelper.isProduction();

      expect(production).toBe(true);
    });

    it.each(['development', 'test'])('is false when NODE_ENV is %s', (nodeEnv) => {
      process.env.NODE_ENV = nodeEnv;

      const production = EnvHelper.isProduction();

      expect(production).toBe(false);
    });

    it('is false when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const production = EnvHelper.isProduction();

      expect(production).toBe(false);
    });
  });
});
