import { DynamicModule, Module } from '@nestjs/common';

import { HEALTH_LIB_PORT } from '@acme-libs/contracts/health';
import { AppNameEnum } from '@acme-libs/kernel';
import { HealthLibCheckLivenessUseCase, HealthLibCheckReadinessUseCase } from '../application';
import { HealthLibDependencyProbeAdapter, HealthLibUptimeAdapter } from '../infrastructure';
import {
  HEALTH_LIB_APP_NAME,
  HEALTH_LIB_DEPENDENCY_PROBE_PORT,
  HEALTH_LIB_UPTIME_PORT,
} from '../outbound';
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
        { provide: HEALTH_LIB_DEPENDENCY_PROBE_PORT, useClass: HealthLibDependencyProbeAdapter },
        { provide: HEALTH_LIB_APP_NAME, useValue: appName },
        { provide: HEALTH_LIB_UPTIME_PORT, useClass: HealthLibUptimeAdapter },
      ],
    };
  }
}
