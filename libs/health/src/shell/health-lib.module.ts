import { DynamicModule } from '@nestjs/common';

import { HEALTH_LIB_PORT } from '@acme-libs/contracts/health';
import { AppNameEnum } from '@acme-libs/kernel';

import { HealthLibCheckLivenessUseCase, HealthLibCheckReadinessUseCase } from '../application';
import {
  HealthLibAppNameProvider,
  HealthLibDependencyProbeAdapter,
  HealthLibUptimeAdapter,
} from '../infrastructure';
import { HealthLibFacade } from './health-lib.facade';

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
        HealthLibAppNameProvider.provide(appName),
        HealthLibUptimeAdapter.provider,
      ],
    };
  }
}
