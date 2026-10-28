import { Module } from '@nestjs/common';

import { CacheModule } from '@acme-libs/cache';
import { AppNameEnum } from '@acme-libs/kernel';
import { LoggerSetupModule } from '@acme-libs/observability';
import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';

@Module({
  imports: [
    ConfigSetupModule.forRoot(),
    LoggerSetupModule.forRoot(AppNameEnum.CLIENT_API),
    TypeOrmSetupModule.forRoot(),
    CacheModule,
  ],
})
export class AppModule {}
