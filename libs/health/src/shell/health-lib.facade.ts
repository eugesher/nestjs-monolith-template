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
    private readonly checkLiveness: HealthLibCheckLivenessUseCase,
    private readonly checkReadiness: HealthLibCheckReadinessUseCase,
  ) {}

  public handleLiveness(): IHealthLibLivenessView {
    return this.checkLiveness.execute();
  }

  public async handleReadiness(): Promise<IHealthLibReadinessView> {
    return await this.checkReadiness.execute();
  }
}
