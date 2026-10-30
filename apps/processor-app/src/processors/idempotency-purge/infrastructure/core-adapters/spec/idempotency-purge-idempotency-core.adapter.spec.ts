import { IdempotencyPurgeIdempotencyCoreAdapter } from '../idempotency-purge-idempotency-core.adapter';

describe('IdempotencyPurgeIdempotencyCoreAdapter', () => {
  let purgeExpired: jest.Mock;
  let adapter: IdempotencyPurgeIdempotencyCoreAdapter;

  beforeEach(() => {
    purgeExpired = jest.fn();
    adapter = new IdempotencyPurgeIdempotencyCoreAdapter({ purgeExpired });
  });

  describe('purgeExpired', () => {
    it('purges the keys older than the TTL through the core module', async () => {
      purgeExpired.mockResolvedValue({ removed: 3 });

      const result = await adapter.purgeExpired(24);

      expect(purgeExpired).toHaveBeenCalledWith({ ttlHours: 24 });
      expect(result).toBeUndefined();
    });

    it('passes a failing purge through', async () => {
      purgeExpired.mockRejectedValue(new Error('database is down'));

      const purging = adapter.purgeExpired(24);

      await expect(purging).rejects.toThrow('database is down');
    });
  });
});
