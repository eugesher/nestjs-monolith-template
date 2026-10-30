import '@acme-libs/observability/tracer';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@acme-processor-app';
import { AppNameEnum } from '@acme-libs/kernel';
import { BootstrapLogger } from '@acme-libs/observability';
import { ApiReference } from '@acme-libs/openapi';

const logger = BootstrapLogger.setup(AppNameEnum.PROCESSOR_APP);

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('PORT');
  const prefix = config.getOrThrow<string>('API_PREFIX');
  const appLogger = app.get(Logger);

  app.useLogger(appLogger);
  app.setGlobalPrefix(prefix);
  app.enableShutdownHooks();

  ApiReference.setup(app, AppNameEnum.PROCESSOR_APP, port);

  await app.listen(port);

  logger.info(`Processor app is listening on port ${port}`);
};

bootstrap().catch((error: unknown) => {
  logger.error(error, 'Processor app bootstrap error');

  process.exit(1);
});
