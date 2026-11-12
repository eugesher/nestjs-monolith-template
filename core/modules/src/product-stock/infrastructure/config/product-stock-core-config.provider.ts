import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductStockCoreConfigRedisCommandTimeoutMsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
});

export const ProductStockCoreConfigEnqueueRetryAttemptsProvider = ConfigValueProvider.provide({
  injectionToken: PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  configProperty: 'ENQUEUE_RETRY_ATTEMPTS',
});
