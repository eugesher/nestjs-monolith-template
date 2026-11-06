import {
  PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  ProductCoreConfigLedgerRetryAttemptsProvider,
  ProductCoreConfigRedisCommandTimeoutMsProvider,
} from '../product-core-config.provider';

describe('product core config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ProductCoreConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the product core token', () => {
      const value = ProductCoreConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(ProductCoreConfigRedisCommandTimeoutMsProvider.provide).toBe(
        PRODUCT_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('ProductCoreConfigLedgerRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the product core token', () => {
      const value = ProductCoreConfigLedgerRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductCoreConfigLedgerRetryAttemptsProvider.provide).toBe(
        PRODUCT_CORE_LEDGER_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
