import {
  ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
  ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  OrderConfigLedgerRetryAttemptsProvider,
  OrderConfigRedisCommandTimeoutMsProvider,
} from '../order-config.provider';

describe('order config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('OrderConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the order token', () => {
      const value = OrderConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(OrderConfigRedisCommandTimeoutMsProvider.provide).toBe(
        ORDER_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('OrderConfigLedgerRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the order token', () => {
      const value = OrderConfigLedgerRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(OrderConfigLedgerRetryAttemptsProvider.provide).toBe(
        ORDER_LEDGER_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
