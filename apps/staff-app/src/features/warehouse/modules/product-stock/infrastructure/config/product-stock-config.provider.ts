import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductStockConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide<number>({
  injectionToken: PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const ProductStockConfigLedgerRetryAttemptsProvider = ConfigValueProvider.provide<number>({
  injectionToken: PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'LEDGER_RETRY_ATTEMPTS',
});
