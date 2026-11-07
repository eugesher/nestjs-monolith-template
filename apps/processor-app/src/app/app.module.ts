import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CacheLibModule } from '@acme-libs/cache';
import { TypeOrmSetupModule } from '@acme-libs/database';
import { HttpExceptionFilter, StrictValidationPipe } from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationSetupModule, LoggerSetupModule } from '@acme-libs/observability';
import { BullSetupModule } from '@acme-libs/queue';
import { AuthModule, HealthModule, QueueModule } from '@acme-processor/features';
import { IdempotencyModule, LedgerModule, ProductStockModule } from '@acme-processor/processors';

import { entities } from './entities';
import { AuthGlobalModule } from './global';
import { ConfigSetupModule, ScheduleSetupModule } from './setup';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.PROCESSOR_APP),
    CorrelationSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(entities),
    ScheduleSetupModule,
    BullSetupModule.forRoot(),
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
