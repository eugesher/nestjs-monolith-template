import { Inject, Injectable } from '@nestjs/common';

import { HealthLivenessStatusEnum, type AppNameEnum } from '@acme-libs/kernel';
import type { IHealthLibLivenessView } from '@acme-libs/contracts/health';

import {
  HEALTH_LIB_APP_NAME_TOKEN,
  HEALTH_LIB_UPTIME_PORT,
  type IHealthLibUptimePort,
} from '../../outbound';

@Injectable()
export class HealthLibCheckLivenessUseCase {
  constructor(
    @Inject(HEALTH_LIB_APP_NAME_TOKEN)
    private readonly appName: AppNameEnum,
    @Inject(HEALTH_LIB_UPTIME_PORT)
    private readonly uptime: IHealthLibUptimePort,
  ) {}

  public execute(): IHealthLibLivenessView {
    const seconds = this.uptime.seconds();

    return {
      status: HealthLivenessStatusEnum.OK,
      app: this.appName,
      uptimeSeconds: Math.floor(seconds),
    };
  }
}
