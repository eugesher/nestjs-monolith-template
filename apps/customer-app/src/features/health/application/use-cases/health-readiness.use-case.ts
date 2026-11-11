import { Inject, Injectable } from '@nestjs/common';

import {
  HEALTH_STATUS_PORT,
  type IHealthStatusPort,
  type IHealthStatusReadinessView,
} from '../../outbound';

@Injectable()
export class HealthReadinessUseCase {
  constructor(
    @Inject(HEALTH_STATUS_PORT)
    private readonly status: IHealthStatusPort,
  ) {}

  public async execute(): Promise<IHealthStatusReadinessView> {
    return await this.status.readiness();
  }
}
