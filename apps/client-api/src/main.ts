import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.CLIENT_API_PORT ?? 3000);

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(`Client API is listening on port ${port}`, 'Bootstrap');
};

bootstrap().catch((error: unknown) => {
  Logger.error(error, 'Client API bootstrap error');

  process.exit(1);
});
