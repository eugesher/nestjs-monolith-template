import { Module } from '@nestjs/common';

import { HealthLibModule } from '@acme-libs/health';
import { AppNameEnum } from '@acme-libs/kernel';

import { HealthLivenessUseCase, HealthReadinessUseCase } from './application';
import { HealthStatusLibAdapter } from './infrastructure';
import { HealthController } from './presentation';

@Module({
  imports: [HealthLibModule.forRoot(AppNameEnum.STAFF_APP)],
  controllers: [HealthController],
  providers: [HealthLivenessUseCase, HealthReadinessUseCase, HealthStatusLibAdapter.provider],
})
export class HealthModule {}
