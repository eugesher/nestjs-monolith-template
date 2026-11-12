import {
  IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN,
  IDEMPOTENCY_KEY_TTL_HOURS_TOKEN,
} from '../../../outbound';
import {
  IdempotencyConfigInFlightTtlMinutesProvider,
  IdempotencyConfigKeyTtlHoursProvider,
} from '../idempotency-config.provider';

describe('idempotency config providers', () => {
  let getOrThrow: jest.Mock;

  beforeEach(() => {
    getOrThrow = jest.fn().mockReturnValue(7);
  });

  describe('IdempotencyConfigKeyTtlHoursProvider', () => {
    it('provides IDEMPOTENCY_KEY_TTL_HOURS under the idempotency token', () => {
      const value = IdempotencyConfigKeyTtlHoursProvider.useFactory({ getOrThrow });

      expect(IdempotencyConfigKeyTtlHoursProvider.provide).toBe(IDEMPOTENCY_KEY_TTL_HOURS_TOKEN);
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('IDEMPOTENCY_KEY_TTL_HOURS');
    });
  });

  describe('IdempotencyConfigInFlightTtlMinutesProvider', () => {
    it('provides IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES under the in-flight token', () => {
      const value = IdempotencyConfigInFlightTtlMinutesProvider.useFactory({ getOrThrow });

      expect(IdempotencyConfigInFlightTtlMinutesProvider.provide).toBe(
        IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES_TOKEN,
      );
      expect(value).toBe(7);
      expect(getOrThrow).toHaveBeenCalledWith('IDEMPOTENCY_IN_FLIGHT_TTL_MINUTES');
    });
  });
});
