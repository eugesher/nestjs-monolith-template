import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductConfigOccRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});

export const ProductConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const ProductConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
