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
import { CorrelationSetupModule, LoggerSetupModule } from '@acme-libs/observability';
import { BullSetupModule } from '@acme-libs/queue';
import {
  CatalogModule,
  HealthModule,
  IdentityModule,
  LedgerModule,
  SalesModule,
  ToolsModule,
  WarehouseModule,
} from '@acme-staff/features';

import { entities } from './entities';
import { AuthGlobalModule } from './global';
import { ConfigSetupModule } from './setup';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.STAFF_APP),
    CorrelationSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(entities),
    BullSetupModule.forRoot(),
    CacheLibModule,
    AuthGlobalModule,
    HealthModule,
    IdentityModule,
    LedgerModule,
    ToolsModule,
    CatalogModule,
    WarehouseModule,
    SalesModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: StrictValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DuplicateKeyExceptionFilter },
  ],
})
export class AppModule {}
