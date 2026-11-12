import { ConfigValueProvider } from '@acme-libs/config';

import {
  IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN,
  IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
} from '../../outbound';

export const IdempotencyConfigKeyTtlHoursProvider = ConfigValueProvider.provide({
  injectionToken: IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
  configProperty: 'IDEMPOTENCY_KEY_TTL_HOURS',
});

export const IdempotencyConfigInFlightTtlMinutesProvider = ConfigValueProvider.provide({
  injectionToken: IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN,
  configProperty: 'IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES',
});
