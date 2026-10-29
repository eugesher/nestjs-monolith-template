import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import {
  HealthModule,
  IamModule,
  LedgerModule,
  NoteModule,
  ProductModule,
  AuthModule,
} from '@acme-staff-features';
import { IdempotencyPurgeModule, LedgerCatalogEventsModule } from '@acme-staff-processors';
import { CacheModule } from '@acme-libs/cache';
import {
  DuplicateKeyExceptionFilter,
  HttpExceptionFilter,
  StrictValidationPipe,
} from '@acme-libs/http';
import { AppNameEnum } from '@acme-libs/kernel';
import { EventsModule } from '@acme-libs/messaging';
import { CorrelationMiddleware, LoggerSetupModule } from '@acme-libs/observability';
import { AuthGlobalModule } from './global';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';
import { ScheduleSetupModule } from './setup/schedule/schedule-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.STAFF_APP),
    TypeOrmSetupModule.forRoot(),
    ScheduleSetupModule,
    CacheModule,
    EventsModule,
    AuthGlobalModule,
    HealthModule,
    AuthModule,
    IamModule,
    LedgerModule,
    NoteModule,
    ProductModule,
    IdempotencyPurgeModule,
    LedgerCatalogEventsModule,
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
