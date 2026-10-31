import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { HealthModule } from '@acme-processor-features';
import {
  IdempotencyPurgeModule,
  LedgerRecordModule,
  ProductStockModule,
} from '@acme-processor-processors';
import { CacheModule } from '@acme-libs/cache';
import { HttpExceptionFilter } from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { CorrelationMiddleware, LoggerSetupModule } from '@acme-libs/observability';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';
import { QueueSetupModule } from './setup/queue/queue-setup.module';
import { ScheduleSetupModule } from './setup/schedule/schedule-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.PROCESSOR_APP),
    TypeOrmSetupModule.forRoot(),
    ScheduleSetupModule,
    QueueSetupModule,
    CacheModule,
    HealthModule,
    IdempotencyPurgeModule,
    LedgerRecordModule,
    ProductStockModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*path');
  }
}
