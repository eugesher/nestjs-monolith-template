import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CacheLibModule } from '@acme-libs/cache';
import { HttpExceptionFilter, StrictValidationPipe } from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationSetupModule, LoggerSetupModule } from '@acme-libs/observability';
import { AuthModule, HealthModule, QueueModule } from '@acme-processor/features';
import { IdempotencyModule, LedgerModule, ProductStockModule } from '@acme-processor/processors';

import { AuthGlobalModule } from './global';
import {
  ConfigSetupModule,
  QueueSetupModule,
  ScheduleSetupModule,
  TypeOrmSetupModule,
} from './setup';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.PROCESSOR_APP),
    CorrelationSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(),
    ScheduleSetupModule,
    QueueSetupModule,
    CacheLibModule,
    AuthGlobalModule,
    AuthModule,
    HealthModule,
    QueueModule,
    IdempotencyModule,
    LedgerModule,
    ProductStockModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: StrictValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
