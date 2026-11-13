import {
  LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
  LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  LedgerCoreConfigEnqueueRetryAttemptsProvider,
  LedgerCoreConfigRedisCommandTimeoutMsProvider,
} from '../ledger-core-config.provider';

describe('ledger lib config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('LedgerCoreConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the ledger lib token', () => {
      const value = LedgerCoreConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(LedgerCoreConfigRedisCommandTimeoutMsProvider.provide).toBe(
        LEDGER_CORE_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('LedgerCoreConfigEnqueueRetryAttemptsProvider', () => {
    it('provides LEDGER_ENQUEUE_RETRY_ATTEMPTS under the ledger lib token', () => {
      const value = LedgerCoreConfigEnqueueRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(LedgerCoreConfigEnqueueRetryAttemptsProvider.provide).toBe(
        LEDGER_CORE_ENQUEUE_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_ENQUEUE_RETRY_ATTEMPTS');
    });
  });
});
