import { Module } from '@nestjs/common';

import { HealthModule, ItemModule, SessionModule } from '@acme-client-features';
import { IdempotencyPurgeModule, LedgerCatalogEventsModule } from '@acme-client-processors';
import { CacheModule } from '@acme-libs/cache';
import { AppNameEnum } from '@acme-libs/kernel';
import { EventsModule } from '@acme-libs/messaging';
import { LoggerSetupModule } from '@acme-libs/observability';
import { AuthModule } from './global';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CLIENT_API),
    TypeOrmSetupModule.forRoot(),
    CacheModule,
    EventsModule,
    AuthModule,
    HealthModule,
    ItemModule,
    SessionModule,
    IdempotencyPurgeModule,
    LedgerCatalogEventsModule,
  ],
})
export class AppModule {}
