import type { ValueProvider } from '@nestjs/common';

import type { AppNameEnum } from '@acme-libs/kernel';

import { HEALTH_LIB_APP_NAME_TOKEN } from '../../outbound';

export class HealthLibAppNameProvider {
  public static provide(appName: AppNameEnum): ValueProvider<AppNameEnum> {
    return { provide: HEALTH_LIB_APP_NAME_TOKEN, useValue: appName };
  }
}
