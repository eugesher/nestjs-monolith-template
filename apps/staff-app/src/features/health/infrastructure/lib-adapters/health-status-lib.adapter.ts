import { Inject, Injectable } from '@nestjs/common';

import { HEALTH_LIB_PORT, type IHealthLibPort } from '@acme-libs/contracts/health';

import { IHealthLivenessView, IHealthReadinessView, IHealthStatusPort } from '../../outbound';

@Injectable()
export class HealthStatusLibAdapter implements IHealthStatusPort {
  constructor(
    @Inject(HEALTH_LIB_PORT)
    private readonly health: IHealthLibPort,
  ) {}

  public liveness(): IHealthLivenessView {
    return this.health.liveness();
  }

  public async readiness(): Promise<IHealthReadinessView> {
    return await this.health.readiness();
  }
}
