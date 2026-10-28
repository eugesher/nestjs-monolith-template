import '@acme-libs/observability/tracer';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from '@acme-client-app';
import { AppNameEnum } from '@acme-libs/kernel';
import { BootstrapLogger } from '@acme-libs/observability';
import { ApiReference } from '@acme-libs/openapi';

const logger = BootstrapLogger.setup(AppNameEnum.CLIENT_API);

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('CLIENT_API_PORT');
  const prefix = config.getOrThrow<string>('API_PREFIX');
  const appLogger = app.get(Logger);

  app.useLogger(appLogger);
  app.setGlobalPrefix(prefix);
  app.enableShutdownHooks();

  ApiReference.setup(app, AppNameEnum.CLIENT_API, port);

  await app.listen(port);

  logger.info(`Client API is listening on port ${port}`);
};

bootstrap().catch((error: unknown) => {
  logger.error(error, 'Client API bootstrap error');

  process.exit(1);
});
