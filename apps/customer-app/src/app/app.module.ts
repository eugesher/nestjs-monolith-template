import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { HealthModule, AuthModule, CatalogModule } from '@acme-customer-features';
import { CacheModule } from '@acme-libs/cache';
import {
  DuplicateKeyExceptionFilter,
  HttpExceptionFilter,
  StrictValidationPipe,
} from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationMiddleware, LoggerSetupModule } from '@acme-libs/observability';
import { AuthGlobalModule } from './global';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';
import { QueueSetupModule } from './setup/queue/queue-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CUSTOMER_APP),
    TypeOrmSetupModule.forRoot(),
    QueueSetupModule,
    CacheModule,
    AuthGlobalModule,
    HealthModule,
    AuthModule,
    CatalogModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: StrictValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DuplicateKeyExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*path');
  }
}
