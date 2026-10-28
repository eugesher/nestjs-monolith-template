import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const port = app.get(ConfigService).getOrThrow<number>('ADMIN_API_PORT');

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`Admin API is listening on port ${port}`, 'Bootstrap');
};

bootstrap().catch((error: unknown) => {
  Logger.error(error, 'Admin API bootstrap error');

  process.exit(1);
});
