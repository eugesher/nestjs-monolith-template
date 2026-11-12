import {
  PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  ProductStockCoreConfigEnqueueRetryAttemptsProvider,
  ProductStockCoreConfigRedisCommandTimeoutMsProvider,
} from '../product-stock-core-config.provider';

describe('product stock core config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ProductStockCoreConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the product stock core token', () => {
      const value = ProductStockCoreConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(ProductStockCoreConfigRedisCommandTimeoutMsProvider.provide).toBe(
        PRODUCT_STOCK_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('ProductStockCoreConfigEnqueueRetryAttemptsProvider', () => {
    it('provides ENQUEUE_RETRY_ATTEMPTS under the product stock core token', () => {
      const value = ProductStockCoreConfigEnqueueRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductStockCoreConfigEnqueueRetryAttemptsProvider.provide).toBe(
        PRODUCT_STOCK_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('ENQUEUE_RETRY_ATTEMPTS');
    });
  });
});
