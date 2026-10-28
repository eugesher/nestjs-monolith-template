import { Module } from '@nestjs/common';

import { HealthModule } from '@acme-client-features';
import { CacheModule } from '@acme-libs/cache';
import { AppNameEnum } from '@acme-libs/kernel';
import { EventsModule } from '@acme-libs/messaging';
import { LoggerSetupModule } from '@acme-libs/observability';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CLIENT_API),
    TypeOrmSetupModule.forRoot(),
    CacheModule,
    EventsModule,
    HealthModule,
  ],
})
export class AppModule {}
