import { ClassProvider, Inject, Injectable } from '@nestjs/common';

import { HEALTH_LIB_PORT, type IHealthLibPort } from '@acme-libs/contracts/health';

import {
  IHealthStatusLivenessView,
  IHealthStatusReadinessView,
  IHealthStatusPort,
  HEALTH_STATUS_PORT,
} from '../../outbound';

@Injectable()
export class HealthStatusLibAdapter implements IHealthStatusPort {
  public static readonly provider: ClassProvider<IHealthStatusPort> = {
    provide: HEALTH_STATUS_PORT,
    useClass: HealthStatusLibAdapter,
  };

  constructor(
    @Inject(HEALTH_LIB_PORT)
    private readonly health: IHealthLibPort,
  ) {}

  public liveness(): IHealthStatusLivenessView {
    return this.health.handleLiveness();
  }

  public async readiness(): Promise<IHealthStatusReadinessView> {
    return await this.health.handleReadiness();
  }
}
