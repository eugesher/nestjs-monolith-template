import { Module } from '@nestjs/common';

import { HealthLibModule } from '@acme-libs/health';
import { AppNameEnum } from '@acme-libs/kernel';
import { HealthController } from './presentation';

@Module({
  imports: [HealthLibModule.forRoot(AppNameEnum.PROCESSOR_APP)],
  controllers: [HealthController],
})
export class HealthModule {}
