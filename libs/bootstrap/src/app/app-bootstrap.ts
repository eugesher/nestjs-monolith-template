import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger, type PinoLogger } from 'nestjs-pino';
import type { Type } from '@nestjs/common';

import { BootstrapLogger } from '@acme-libs/observability';
import { ApiReference } from '@acme-libs/openapi';
import type { AppNameEnum } from '@acme-libs/kernel';

export class AppBootstrap {
  public static async run(appModule: Type<unknown>, appName: AppNameEnum): Promise<void> {
    const logger = BootstrapLogger.setup(appName);

    try {
      await AppBootstrap.start(appModule, appName, logger);
    } catch (error: unknown) {
      logger.error(error, `${appName} bootstrap error`);

      process.exit(1);
    }
  }

  private static async start(
    appModule: Type<unknown>,
    appName: AppNameEnum,
    logger: PinoLogger,
  ): Promise<void> {
    const app = await NestFactory.create(appModule, { bufferLogs: true });
    const config = app.get(ConfigService);
    const port = config.getOrThrow<number>('PORT');
    const prefix = config.getOrThrow<string>('API_PREFIX');
    const appLogger = app.get(Logger);

    app.useLogger(appLogger);
    app.setGlobalPrefix(prefix);
    app.enableShutdownHooks();

    ApiReference.setup(app, appName);

    await app.listen(port);

    logger.info(`${appName} is listening on port ${port}`);
  }
}
