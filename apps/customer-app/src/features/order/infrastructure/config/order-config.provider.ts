import { ConfigValueProvider } from '@acme-libs/config';

import {
  ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
  ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const OrderConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const OrderConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
