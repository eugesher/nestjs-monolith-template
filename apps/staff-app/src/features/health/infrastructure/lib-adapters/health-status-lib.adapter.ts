import { Inject, Injectable, type ClassProvider } from '@nestjs/common';

import { HEALTH_LIB_PORT, type IHealthLibPort } from '@acme-libs/contracts/health';

import {
  HEALTH_STATUS_PORT,
  type IHealthStatusLivenessView,
  type IHealthStatusPort,
  type IHealthStatusReadinessView,
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
