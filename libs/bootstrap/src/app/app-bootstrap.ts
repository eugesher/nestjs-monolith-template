import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import type { INestApplication } from '@nestjs/common';

import { ApiReference } from '@acme-libs/openapi';
import type { AppNameEnum } from '@acme-libs/kernel';

export class AppBootstrap {
  private readonly config: ConfigService;
  private readonly port: number;
  private readonly prefix: string;
  private readonly logger: Logger;

  private constructor(
    private readonly app: INestApplication,
    private readonly appName: AppNameEnum,
  ) {
    this.config = app.get(ConfigService);
    this.port = this.config.getOrThrow<number>('PORT');
    this.prefix = this.config.getOrThrow<string>('API_PREFIX');
    this.logger = app.get(Logger);
  }

  public static create(app: INestApplication, appName: AppNameEnum): AppBootstrap {
    return new AppBootstrap(app, appName);
  }

  public async execute(): Promise<void> {
    this.app.useLogger(this.logger);
    this.app.setGlobalPrefix(this.prefix);
    this.app.enableShutdownHooks();

    ApiReference.setup(this.app, this.appName);

    await this.app.listen(this.port);

    this.logger.log(`${this.appName} is listening on port ${this.port}`);
  }
}
