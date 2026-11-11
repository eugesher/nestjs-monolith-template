import type { ICacheLibPort } from '@acme-libs/contracts/cache';

import { ReminderSummaryCacheAdapter } from '../reminder-summary-cache.adapter';

describe('ReminderSummaryCacheAdapter', () => {
  let handleWrap: jest.Mock;
  let handleDelByPrefix: jest.Mock;
  let adapter: ReminderSummaryCacheAdapter;

  beforeEach(() => {
    handleWrap = jest.fn();
    handleDelByPrefix = jest.fn();
    adapter = new ReminderSummaryCacheAdapter({
      handleWrap,
      handleDelByPrefix,
    } as unknown as ICacheLibPort);
  });

  describe('read', () => {
    it('reads the summary of the owner through the cache under its key and TTL', async () => {
      const compute = jest.fn();
      handleWrap.mockResolvedValue({ pending: 2, nextDueOn: '2026-06-01' });

      const summary = await adapter.read({ ownerId: 'user-1', ttlMs: 60_000, compute });

      expect(summary).toEqual({ pending: 2, nextDueOn: '2026-06-01' });
      expect(handleWrap).toHaveBeenCalledWith({
        key: 'acme:reminders:summary:v1:user-1:__all__',
        ttlMs: 60_000,
        compute,
      });
      expect(compute).not.toHaveBeenCalled();
    });
  });

  describe('invalidate', () => {
    it('deletes every summary key of the owner by its prefix', async () => {
      handleDelByPrefix.mockResolvedValue(1);

      await adapter.invalidate('user-1');

      expect(handleDelByPrefix).toHaveBeenCalledWith('acme:reminders:summary:v1:user-1:');
    });
  });
});
