import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import {
  AppNameEnum,
  HealthDependencyStatusEnum,
  HealthReadinessStatusEnum,
} from '@acme-libs/kernel';
import { IHealthLibDependenciesView, IHealthLibReadinessView } from '@acme-libs/contracts/health';

import {
  HEALTH_LIB_APP_NAME_TOKEN,
  HEALTH_LIB_DEPENDENCY_PROBE_PORT,
  type IHealthLibDependencyProbePort,
} from '../../outbound';

@Injectable()
export class HealthLibCheckReadinessUseCase {
  constructor(
    @Inject(HEALTH_LIB_APP_NAME_TOKEN)
    private readonly appName: AppNameEnum,
    @Inject(HEALTH_LIB_DEPENDENCY_PROBE_PORT)
    private readonly probes: IHealthLibDependencyProbePort,
    @InjectPinoLogger(HealthLibCheckReadinessUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(): Promise<IHealthLibReadinessView> {
    const dependencies = await this.probes.probeAll();
    const names = Object.keys(dependencies) as (keyof IHealthLibDependenciesView)[];
    const failed = names.filter(
      (name) => dependencies[name].status !== HealthDependencyStatusEnum.OK,
    );

    if (failed.length > 0) {
      this.logger.warn({ failed }, 'Readiness check failed');

      return { status: HealthReadinessStatusEnum.NOT_READY, app: this.appName, dependencies };
    }

    return { status: HealthReadinessStatusEnum.READY, app: this.appName, dependencies };
  }
}
