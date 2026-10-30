import type { Queue } from 'bull';

import { ILedgerRecordProcessorPayload } from '@acme-core/contracts/ledger';
import { LedgerRecordQueueAdapter } from '../ledger-record-queue.adapter';

describe('LedgerRecordQueueAdapter', () => {
  let getFailed: jest.Mock;
  let adapter: LedgerRecordQueueAdapter;

  beforeEach(() => {
    getFailed = jest.fn().mockResolvedValue([]);
    adapter = new LedgerRecordQueueAdapter({
      getFailed,
    } as unknown as Queue<ILedgerRecordProcessorPayload>);
  });

  describe('retryFailed', () => {
    it('moves every failed job back to the queue and counts them', async () => {
      const first = { retry: jest.fn().mockResolvedValue(undefined) };
      const second = { retry: jest.fn().mockResolvedValue(undefined) };

      getFailed.mockResolvedValue([first, second]);

      const retried = await adapter.retryFailed();

      expect(retried).toBe(2);
      expect(getFailed).toHaveBeenCalledWith();
      expect(first.retry).toHaveBeenCalledTimes(1);
      expect(second.retry).toHaveBeenCalledTimes(1);
    });

    it('counts nothing when no job failed', async () => {
      const retried = await adapter.retryFailed();

      expect(retried).toBe(0);
    });

    it('passes a failing retry through', async () => {
      getFailed.mockResolvedValue([{ retry: jest.fn().mockRejectedValue(new Error('locked')) }]);

      const retrying = adapter.retryFailed();

      await expect(retrying).rejects.toThrow('locked');
    });
  });
});
