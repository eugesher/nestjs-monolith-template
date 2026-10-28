import { PinoLogger } from 'nestjs-pino';

import { AppNameEnum } from '@acme-libs/kernel';
import { BootstrapLogger } from '../bootstrap-logger';

describe('BootstrapLogger', () => {
  describe('setup', () => {
    it('builds a pino logger that logs out of DI in the format of the app', () => {
      const logger = BootstrapLogger.setup(AppNameEnum.ADMIN_API);

      expect(logger).toBeInstanceOf(PinoLogger);
    });
  });
});
