import {
  PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN,
  PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  ProductConfigLedgerRetryAttemptsProvider,
  ProductConfigOccRetryAttemptsProvider,
  ProductConfigRedisCommandTimeoutMsProvider,
} from '../product-config.provider';

describe('product config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ProductConfigOccRetryAttemptsProvider', () => {
    it('provides OCC_RETRY_ATTEMPTS under the product token', () => {
      const value = ProductConfigOccRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductConfigOccRetryAttemptsProvider.provide).toBe(PRODUCT_OCC_RETRY_ATTEMPTS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });

  describe('ProductConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the product token', () => {
      const value = ProductConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(ProductConfigRedisCommandTimeoutMsProvider.provide).toBe(
        PRODUCT_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('ProductConfigLedgerRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the product token', () => {
      const value = ProductConfigLedgerRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ProductConfigLedgerRetryAttemptsProvider.provide).toBe(
        PRODUCT_LEDGER_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
