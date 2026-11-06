import {
  AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN,
  AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
} from '../../../outbound';
import {
  AuthConfigLedgerRetryAttemptsProvider,
  AuthConfigRedisCommandTimeoutMsProvider,
} from '../auth-config.provider';

describe('auth config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('AuthConfigRedisCommandTimeoutMsProvider', () => {
    it('provides REDIS_COMMAND_TIMEOUT_MS under the auth token', () => {
      const value = AuthConfigRedisCommandTimeoutMsProvider.useFactory({ getOrThrow });

      expect(AuthConfigRedisCommandTimeoutMsProvider.provide).toBe(
        AUTH_REDIS_COMMAND_TIMEOUT_MS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('REDIS_COMMAND_TIMEOUT_MS');
    });
  });

  describe('AuthConfigLedgerRetryAttemptsProvider', () => {
    it('provides LEDGER_RETRY_ATTEMPTS under the auth token', () => {
      const value = AuthConfigLedgerRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(AuthConfigLedgerRetryAttemptsProvider.provide).toBe(AUTH_LEDGER_RETRY_ATTEMPTS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('LEDGER_RETRY_ATTEMPTS');
    });
  });
});
