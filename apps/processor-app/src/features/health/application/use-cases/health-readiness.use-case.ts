import { Inject, Injectable } from '@nestjs/common';

import { HEALTH_STATUS_PORT, IHealthReadinessView, type IHealthStatusPort } from '../../outbound';

@Injectable()
export class HealthReadinessUseCase {
  constructor(
    @Inject(HEALTH_STATUS_PORT)
    private readonly status: IHealthStatusPort,
  ) {}

  public async execute(): Promise<IHealthReadinessView> {
    return await this.status.readiness();
  }
}
