import { type ICachePort } from '@acme-libs/contracts/cache';
import { ReminderSummaryCacheAdapter } from '../reminder-summary-cache.adapter';

describe('ReminderSummaryCacheAdapter', () => {
  let wrap: jest.Mock;
  let delByPrefix: jest.Mock;
  let adapter: ReminderSummaryCacheAdapter;

  beforeEach(() => {
    wrap = jest.fn();
    delByPrefix = jest.fn();
    adapter = new ReminderSummaryCacheAdapter(60_000, {
      wrap,
      delByPrefix,
    } as unknown as ICachePort);
  });

  describe('read', () => {
    it('reads the summary of the owner through the cache under its key and TTL', async () => {
      const compute = jest.fn();
      wrap.mockResolvedValue({ pending: 2, nextDueOn: '2026-06-01' });

      const summary = await adapter.read({ ownerId: 'user-1', compute });

      expect(summary).toEqual({ pending: 2, nextDueOn: '2026-06-01' });
      expect(wrap).toHaveBeenCalledWith(
        'acme:reminders:summary:v1:user-1:__all__',
        60_000,
        compute,
      );
      expect(compute).not.toHaveBeenCalled();
    });
  });

  describe('invalidate', () => {
    it('deletes every summary key of the owner by its prefix', async () => {
      delByPrefix.mockResolvedValue(1);

      await adapter.invalidate('user-1');

      expect(delByPrefix).toHaveBeenCalledWith('acme:reminders:summary:v1:user-1:');
    });
  });
});
