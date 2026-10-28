import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.ADMIN_API_PORT ?? 3001);

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`Admin API is listening on port ${port}`, 'Bootstrap');
};

bootstrap().catch((error: unknown) => {
  Logger.error(error, 'Admin API bootstrap error');

  process.exit(1);
});
