import { ClassProvider, Injectable } from '@nestjs/common';

import { HEALTH_LIB_UPTIME_PORT, IHealthLibUptimePort } from '../../outbound';

@Injectable()
export class HealthLibUptimeAdapter implements IHealthLibUptimePort {
  public static readonly provider: ClassProvider<IHealthLibUptimePort> = {
    provide: HEALTH_LIB_UPTIME_PORT,
    useClass: HealthLibUptimeAdapter,
  };

  public seconds(): number {
    return process.uptime();
  }
}
