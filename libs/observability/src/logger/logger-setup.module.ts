import { DynamicModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppNameEnum } from '@acme-libs/kernel';
import { LoggerSetupConfig } from './config/logger-setup.config';

export class LoggerSetupModule {
  public static forRoot(appName: AppNameEnum): DynamicModule {
    const config = new LoggerSetupConfig(appName);

    return LoggerModule.forRoot(config);
  }
}
