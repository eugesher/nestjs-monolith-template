import { Inject, Injectable } from '@nestjs/common';

import { IHealthLibLivenessView } from '@acme-libs/contracts/health';
import { AppNameEnum } from '@acme-libs/kernel';
import {
  HEALTH_LIB_APP_NAME,
  HEALTH_LIB_UPTIME_PORT,
  type IHealthLibUptimePort,
} from '../../outbound';

@Injectable()
export class HealthLibCheckLivenessUseCase {
  constructor(
    @Inject(HEALTH_LIB_APP_NAME)
    private readonly appName: AppNameEnum,
    @Inject(HEALTH_LIB_UPTIME_PORT)
    private readonly uptime: IHealthLibUptimePort,
  ) {}

  public execute(): IHealthLibLivenessView {
    const seconds = this.uptime.seconds();

    return { status: 'ok', app: this.appName, uptimeSeconds: Math.floor(seconds) };
  }
}
