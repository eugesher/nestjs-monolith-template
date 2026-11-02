import { Inject, Injectable } from '@nestjs/common';

import { HEALTH_STATUS_PORT, IHealthLivenessView, type IHealthStatusPort } from '../../outbound';

@Injectable()
export class HealthLivenessUseCase {
  constructor(
    @Inject(HEALTH_STATUS_PORT)
    private readonly status: IHealthStatusPort,
  ) {}

  public execute(): IHealthLivenessView {
    return this.status.liveness();
  }
}
