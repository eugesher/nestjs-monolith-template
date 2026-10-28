import { Module } from '@nestjs/common';

import { ConfigSetupModule } from './setup/config/config-setup.module';

@Module({
  imports: [ConfigSetupModule.forRoot()],
})
export class AppModule {}
