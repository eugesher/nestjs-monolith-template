import '@acme-libs/observability/tracer';

import { NestFactory } from '@nestjs/core';
import type { NestApplicationOptions } from '@nestjs/common';

import { AppBootstrap } from '@acme-libs/bootstrap';
import { AppNameEnum } from '@acme-libs/kernel';
import { BootstrapLogger } from '@acme-libs/observability';
import { AppModule } from '@acme-staff/app/app.module';

void (async () => {
  const appName = AppNameEnum.STAFF_APP;
  const logger = BootstrapLogger.setup(appName);
  const options: NestApplicationOptions = { bufferLogs: true };

  try {
    const app = await NestFactory.create(AppModule, options);
    const bootstrap = AppBootstrap.create(app, appName);

    await bootstrap.execute();
  } catch (error: unknown) {
    logger.error(error, `${appName} bootstrap error`);

    process.exit(1);
  }
})();
