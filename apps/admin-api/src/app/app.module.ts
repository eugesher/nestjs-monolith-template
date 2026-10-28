import { Module } from '@nestjs/common';

import { ConfigSetupModule } from './setup/config/config-setup.module';
import { TypeOrmSetupModule } from './setup/orm/type-orm-setup.module';

@Module({
  imports: [ConfigSetupModule.forRoot(), TypeOrmSetupModule.forRoot()],
})
export class AppModule {}
