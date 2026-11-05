import { IdempotencyPurgeHelper } from '../idempotency-purge.helper';

describe('IdempotencyPurgeHelper', () => {
  describe('expiryCutoff', () => {
    it('is the instant that lies the TTL before now', () => {
      const cutoff = IdempotencyPurgeHelper.expiryCutoff(new Date('2026-01-02T12:00:00.000Z'), 24);

      expect(cutoff).toEqual(new Date('2026-01-01T12:00:00.000Z'));
    });
  });
});
