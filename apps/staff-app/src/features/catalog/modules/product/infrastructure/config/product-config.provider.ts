import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductConfigOccRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'OCC_RETRY_ATTEMPTS',
});

export const ProductConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide<number>({
  injectionToken: PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const ProductConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
