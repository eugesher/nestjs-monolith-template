import { IdempotencyPurgeIdempotencyCommonAdapter } from '../idempotency-purge-idempotency-common.adapter';

describe('IdempotencyPurgeIdempotencyCommonAdapter', () => {
  let purgeExpired: jest.Mock;
  let adapter: IdempotencyPurgeIdempotencyCommonAdapter;

  beforeEach(() => {
    purgeExpired = jest.fn();
    adapter = new IdempotencyPurgeIdempotencyCommonAdapter({
      claim: jest.fn(),
      complete: jest.fn(),
      release: jest.fn(),
      purgeExpired,
    });
  });

  describe('purgeExpired', () => {
    it('purges the expired keys through the common module', async () => {
      purgeExpired.mockResolvedValue({ removed: 3 });

      const result = await adapter.purgeExpired();

      expect(purgeExpired).toHaveBeenCalledWith();
      expect(result).toBeUndefined();
    });

    it('passes a failing purge through', async () => {
      purgeExpired.mockRejectedValue(new Error('database is down'));

      const purging = adapter.purgeExpired();

      await expect(purging).rejects.toThrow('database is down');
    });
  });
});
