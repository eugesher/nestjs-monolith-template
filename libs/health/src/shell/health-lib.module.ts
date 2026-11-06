import { DynamicModule, Module } from '@nestjs/common';

import { HEALTH_LIB_PORT } from '@acme-libs/contracts/health';
import { AppNameEnum } from '@acme-libs/kernel';

import { HealthLibCheckLivenessUseCase, HealthLibCheckReadinessUseCase } from '../application';
import { HealthLibDependencyProbeAdapter, HealthLibUptimeAdapter } from '../infrastructure';
import { HEALTH_LIB_APP_NAME_TOKEN } from '../outbound';
import { HealthLibFacade } from './health-lib.facade';

@Module({})
export class HealthLibModule {
  public static forRoot(appName: AppNameEnum): DynamicModule {
    return {
      module: HealthLibModule,
      exports: [HEALTH_LIB_PORT],
      providers: [
        { provide: HEALTH_LIB_PORT, useClass: HealthLibFacade },
        HealthLibCheckLivenessUseCase,
        HealthLibCheckReadinessUseCase,
        HealthLibDependencyProbeAdapter.provider,
        { provide: HEALTH_LIB_APP_NAME_TOKEN, useValue: appName },
        HealthLibUptimeAdapter.provider,
      ],
    };
  }
}
