import { Inject, Injectable } from '@nestjs/common';

import {
  HEALTH_STATUS_PORT,
  type IHealthStatusLivenessView,
  type IHealthStatusPort,
} from '../../outbound';

@Injectable()
export class HealthLivenessUseCase {
  constructor(
    @Inject(HEALTH_STATUS_PORT)
    private readonly status: IHealthStatusPort,
  ) {}

  public execute(): IHealthStatusLivenessView {
    return this.status.liveness();
  }
}
