import { AppNameEnum } from '@acme-libs/kernel';

import { HEALTH_LIB_APP_NAME_TOKEN } from '../../../outbound';
import { HealthLibAppNameProvider } from '../health-lib-app-name.provider';

describe('HealthLibAppNameProvider', () => {
  it('binds the app name to the health lib token', () => {
    const provider = HealthLibAppNameProvider.provide(AppNameEnum.STAFF_APP);

    expect(provider).toEqual({ provide: HEALTH_LIB_APP_NAME_TOKEN, useValue: 'staff-app' });
  });
});
