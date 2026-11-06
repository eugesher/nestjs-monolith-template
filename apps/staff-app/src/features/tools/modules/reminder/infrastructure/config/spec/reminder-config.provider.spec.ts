import {
  REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
  REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
} from '../../../outbound';
import {
  ReminderConfigCacheTtlMsDefaultProvider,
  ReminderConfigOccRetryAttemptsProvider,
} from '../reminder-config.provider';

describe('reminder config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('ReminderConfigOccRetryAttemptsProvider', () => {
    it('provides OCC_RETRY_ATTEMPTS under the reminder token', () => {
      const value = ReminderConfigOccRetryAttemptsProvider.useFactory({ getOrThrow });

      expect(ReminderConfigOccRetryAttemptsProvider.provide).toBe(
        REMINDER_OCC_RETRY_ATTEMPTS_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('OCC_RETRY_ATTEMPTS');
    });
  });

  describe('ReminderConfigCacheTtlMsDefaultProvider', () => {
    it('provides CACHE_TTL_MS_DEFAULT under the reminder token', () => {
      const value = ReminderConfigCacheTtlMsDefaultProvider.useFactory({ getOrThrow });

      expect(ReminderConfigCacheTtlMsDefaultProvider.provide).toBe(
        REMINDER_CACHE_TTL_MS_DEFAULT_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('CACHE_TTL_MS_DEFAULT');
    });
  });
});
