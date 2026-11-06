import {
  PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  ProductStockConfigLedgerRetryAttemptsProvider,
  ProductStockConfigRedisCommandTimeoutMsProvider,
} from '../product-stock-config.provider';

describe('product stock config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ProductStockConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the product stock token', () => {
      const value = ProductStockConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(ProductStockConfigRedisCommandTimeoutMsProvider.provide).toBe(
        PRODUCT_STOCK_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('ProductStockConfigLedgerRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the product stock token', () => {
      const value = ProductStockConfigLedgerRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductStockConfigLedgerRetryAttemptsProvider.provide).toBe(
        PRODUCT_STOCK_LEDGER_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
