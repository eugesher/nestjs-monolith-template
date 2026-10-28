import { Injectable } from '@nestjs/common';

import { IHealthLibUptimePort } from '../../outbound';

@Injectable()
export class HealthLibUptimeAdapter implements IHealthLibUptimePort {
  public seconds(): number {
    return process.uptime();
  }
}
