import { ConfigValueProvider } from '@acme-libs/config';

import {
  LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const LedgerCoreConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const LedgerCoreConfigEnqueueRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_ENQUEUE_RETRY_ATTEMPTS',
});
