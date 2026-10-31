import { Injectable } from '@nestjs/common';

import {
  IHealthLibLivenessView,
  IHealthLibPort,
  IHealthLibReadinessView,
} from '@acme-libs/contracts/health';
import { HealthLibCheckLivenessUseCase, HealthLibCheckReadinessUseCase } from '../application';

@Injectable()
export class HealthLibFacade implements IHealthLibPort {
  constructor(
    private readonly healthLibCheckLiveness: HealthLibCheckLivenessUseCase,
    private readonly healthLibCheckReadiness: HealthLibCheckReadinessUseCase,
  ) {}

  public liveness(): IHealthLibLivenessView {
    return this.healthLibCheckLiveness.execute();
  }

  public async readiness(): Promise<IHealthLibReadinessView> {
    return await this.healthLibCheckReadiness.execute();
  }
}
