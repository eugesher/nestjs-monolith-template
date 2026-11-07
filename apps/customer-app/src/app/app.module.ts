import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CacheModule } from '@acme-libs/cache';
import {
  DuplicateKeyExceptionFilter,
  HttpExceptionFilter,
  StrictValidationPipe,
} from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationSetupModule, LoggerSetupModule } from '@acme-libs/observability';
import { AuthModule, CatalogModule, HealthModule, OrderModule } from '@acme-customer/features';

import { AuthGlobalModule } from './global';
import { ConfigSetupModule, QueueSetupModule, TypeOrmSetupModule } from './setup';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CUSTOMER_APP),
    CorrelationSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(),
    QueueSetupModule,
    CacheModule,
    AuthGlobalModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    OrderModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: StrictValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DuplicateKeyExceptionFilter },
  ],
})
export class AppModule {}
