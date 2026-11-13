import { symbols } from 'pino';

import { AppNameEnum } from '@acme-libs/kernel';

import { BootstrapLogger } from '../bootstrap-logger';

describe('BootstrapLogger', () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = process.env;
    process.env = { ...env };
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    process.env = env;
  });

  describe('setup', () => {
    it('builds a pino logger that logs out of DI in the format of the app', () => {
      const lines: string[] = [];
      const logger = BootstrapLogger.setup(AppNameEnum.STAFF_APP);

      Object.assign(logger.logger, {
        [symbols.streamSym]: { write: (line: string) => lines.push(line) },
      });
      logger.debug('staff-app is listening on port 3000');

      expect(lines.map((line) => JSON.parse(line) as unknown)).toEqual([
        expect.objectContaining({
          level: 20,
          app: 'staff-app',
          msg: 'staff-app is listening on port 3000',
        }),
      ]);
    });
  });
});
