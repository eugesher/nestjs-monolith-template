import { ConfigValueProvider } from '@acme-libs/config';

import { IDEMPOTENCY_KEY_TTL_HOURS_TOKEN } from '../../outbound';

export const IdempotencyConfigKeyTtlHoursProvider = ConfigValueProvider.provide({
  injectionToken: IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
  configProperty: 'IDEMPOTENCY_KEY_TTL_HOURS',
});
