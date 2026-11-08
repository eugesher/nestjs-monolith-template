import { ConfigValueProvider } from '@acme-libs/config';

import {
  AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
  AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const AuthConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const AuthConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
