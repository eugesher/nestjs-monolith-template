import {
  LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
  LEDGER_LIB_RETRY_ATTEMPTS_TOKEN,
} from '../../../outbound';
import {
  LedgerLibConfigRedisCommandTimeoutMsProvider,
  LedgerLibConfigRetryAttemptsProvider,
} from '../ledger-lib-config.provider';

describe('ledger lib config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('LedgerLibConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the ledger lib token', () => {
      const value = LedgerLibConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(LedgerLibConfigRedisCommandTimeoutMsProvider.provide).toBe(
        LEDGER_LIB_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('LedgerLibConfigRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the ledger lib token', () => {
      const value = LedgerLibConfigRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(LedgerLibConfigRetryAttemptsProvider.provide).toBe(LEDGER_LIB_RETRY_ATTEMPTS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
