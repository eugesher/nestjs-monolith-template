import { Module } from '@nestjs/common';

import { HealthLibModule } from '@acme-libs/health';
import { AppNameEnum } from '@acme-libs/kernel';

import { HealthLivenessUseCase, HealthReadinessUseCase } from './application';
import { HealthStatusLibAdapter } from './infrastructure';
import { HEALTH_STATUS_PORT } from './outbound';
import { HealthController } from './presentation';

@Module({
  imports: [HealthLibModule.forRoot(AppNameEnum.CUSTOMER_APP)],
  controllers: [HealthController],
  providers: [
    HealthLivenessUseCase,
    HealthReadinessUseCase,
    { provide: HEALTH_STATUS_PORT, useClass: HealthStatusLibAdapter },
  ],
})
export class HealthModule {}
