import { PinoLogger } from 'nestjs-pino';

import { AppNameEnum } from '@acme-libs/kernel';
import { LoggerSetupConfig } from '../config/logger-setup.config';

export class BootstrapLogger {
  public static setup(appName: AppNameEnum): PinoLogger {
    const config = new LoggerSetupConfig(appName);

    return new PinoLogger(config);
  }
}
