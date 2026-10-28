import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { IHealthLibReadinessView } from '@acme-libs/contracts/health';
import {
  HEALTH_LIB_DEPENDENCY_PROBE_PORT,
  type IHealthLibDependencyProbePort,
} from '../../outbound';

@Injectable()
export class HealthLibCheckReadinessUseCase {
  constructor(
    @Inject(HEALTH_LIB_DEPENDENCY_PROBE_PORT)
    private readonly probes: IHealthLibDependencyProbePort,
    @InjectPinoLogger(HealthLibCheckReadinessUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  public async execute(): Promise<IHealthLibReadinessView> {
    const dependencies = await this.probes.probeAll();
    const failed = Object.keys(dependencies).filter((name) => dependencies[name].status !== 'ok');

    if (failed.length > 0) {
      this.logger.warn({ failed }, 'Readiness check failed');

      return { status: 'not-ready', dependencies };
    }

    return { status: 'ready', dependencies };
  }
}
