import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { CacheModule } from '@acme-libs/cache';
import { HttpExceptionFilter, StrictValidationPipe } from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationSetupModule, LoggerSetupModule } from '@acme-libs/observability';
import { AuthModule, HealthModule, QueueModule } from '@acme-processor/features';
import { IdempotencyModule, LedgerModule, ProductStockModule } from '@acme-processor/processors';

import { AuthGlobalModule } from './global';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';
import { QueueSetupModule } from './setup/queue/queue-setup.module';
import { ScheduleSetupModule } from './setup/schedule/schedule-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.PROCESSOR_APP),
    CorrelationSetupModule.forRoot(),
    TypeOrmSetupModule.forRoot(),
    ScheduleSetupModule,
    QueueSetupModule,
    CacheModule,
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
