import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CacheLibModule } from '@acme-libs/cache';
import { TypeOrmSetupModule } from '@acme-libs/database';
import {
  DuplicateKeyExceptionFilter,
  HttpExceptionFilter,
  StrictValidationPipe,
} from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { ClsSetupModule, ClsTransactionalModule } from '@acme-libs/local-storage';
import { LoggerSetupModule } from '@acme-libs/observability';
import { BullSetupModule } from '@acme-libs/queue';
import { AuthModule, CatalogModule, HealthModule, OrderModule } from '@acme-customer/features';

import { entities } from './entities';
import { AuthGlobalModule } from './global';
import { ConfigSetupModule } from './setup';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CUSTOMER_APP),
    ClsSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(entities),
    ClsTransactionalModule.forRoot(),
    BullSetupModule.forRoot(),
    CacheLibModule,
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
