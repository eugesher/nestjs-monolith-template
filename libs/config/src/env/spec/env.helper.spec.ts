import fs from 'fs';
import { join } from 'path';

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

  describe('appEnvFilePaths', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it.each(['development', 'production'])(
      'returns the .env of the app under the repository root when NODE_ENV is %s',
      (nodeEnv) => {
        process.env.NODE_ENV = nodeEnv;
        const root = join(__dirname, '../../../../..');

        const paths = EnvHelper.appEnvFilePaths('staff-app');

        expect(paths).toEqual([join(root, 'env/apps/staff-app/.env')]);
      },
    );

    it('returns the .env.test of the app when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test';
      const root = join(__dirname, '../../../../..');

      const paths = EnvHelper.appEnvFilePaths('staff-app');

      expect(paths).toEqual([join(root, 'env/apps/staff-app/.env.test')]);
    });

    it('returns no files outside the repository', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const paths = EnvHelper.appEnvFilePaths('staff-app');

      expect(paths).toEqual([]);
    });
  });
});
