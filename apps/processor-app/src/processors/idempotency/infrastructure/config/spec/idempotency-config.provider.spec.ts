import { IDEMPOTENCY_KEY_TTL_HOURS_TOKEN } from '../../../outbound';
import { IdempotencyConfigKeyTtlHoursProvider } from '../idempotency-config.provider';

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
});
