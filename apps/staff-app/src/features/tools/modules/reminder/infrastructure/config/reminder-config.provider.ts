import { ConfigValueProvider } from '@acme-libs/config';

import {
  REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
  REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
} from '../../outbound';

export const ReminderConfigOccRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});

export const ReminderConfigCacheTtlMsDefaultProvider = ConfigValueProvider.provide<number>({
  injectionToken: REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
  configProperty: 'CACHE_TTL_MS_DEFAULT',
});
