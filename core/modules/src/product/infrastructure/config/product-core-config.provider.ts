import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductCoreConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const ProductCoreConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
