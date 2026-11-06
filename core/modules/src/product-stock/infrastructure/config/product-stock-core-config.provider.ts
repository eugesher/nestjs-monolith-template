import { ConfigValueProvider } from '@acme-libs/config';

import {
  PRODUCT_STOCK_CORE_QUEUE_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../outbound';

export const ProductStockCoreConfigRedisCommandTimeoutMsProvider =
  ConfigValueProvider.provide<number>({
    injectionToken: PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
    configProperty: 'REDIS_COMMAND_TIMEOUT_MS',
  });

export const ProductStockCoreConfigQueueRetryAttemptsProvider = ConfigValueProvider.provide<number>(
  {
    injectionToken: PRODUCT_STOCK_CORE_QUEUE_RETRY_ATTEMPTS_TOKEN,
    configProperty: 'QUEUE_RETRY_ATTEMPTS',
  },
);
