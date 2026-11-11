import { ConfigValueProvider } from '@acme-libs/config';

import {
  LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  LEDGER_LIB_RETRY_ATTEMPTS_TOKEN,
} from '../../outbound';

export const LedgerLibConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const LedgerLibConfigRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: LEDGER_LIB_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
