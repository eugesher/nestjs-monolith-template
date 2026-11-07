import { Queue } from 'bull';

import { QueueRegistryQueueAdapter } from '../queue-registry-queue.adapter';

describe('QueueRegistryQueueAdapter', () => {
  let ledgerQueue: jest.Mocked<
    Pick<Queue, 'name' | 'getJobCounts' | 'getFailed' | 'getFailedCount' | 'getJob'>
  >;
  let stockQueue: jest.Mocked<Pick<Queue, 'name' | 'getJobCounts'>>;
  let adapter: QueueRegistryQueueAdapter;

  beforeEach(() => {
    ledgerQueue = {
      name: 'ledger-record',
      getJobCounts: jest.fn(),
      getFailed: jest.fn(),
      getFailedCount: jest.fn(),
      getJob: jest.fn(),
    };
    stockQueue = { name: 'product-stock-post-subtract', getJobCounts: jest.fn() };
    adapter = new QueueRegistryQueueAdapter(
      ledgerQueue as unknown as Queue,
      stockQueue as unknown as Queue,
    );
  });

  describe('has', () => {
    it('knows the injected queues by their names only', () => {
      expect(adapter.has('ledger-record')).toBe(true);
      expect(adapter.has('product-stock-post-subtract')).toBe(true);
      expect(adapter.has('unknown')).toBe(false);
    });
  });

  describe('listJobCounts', () => {
    it('answers every queue with its job counts', async () => {
      ledgerQueue.getJobCounts.mockResolvedValue({
        active: 0,
        completed: 0,
        failed: 2,
        delayed: 0,
        waiting: 1,
      });
      stockQueue.getJobCounts.mockResolvedValue({
        active: 1,
        completed: 0,
        failed: 0,
        delayed: 0,
        waiting: 0,
        paused: 3,
      } as never);

      const queues = await adapter.listJobCounts();

      expect(queues).toEqual([
        {
          name: 'ledger-record',
          jobCounts: { active: 0, completed: 0, failed: 2, delayed: 0, waiting: 1, paused: null },
        },
        {
          name: 'product-stock-post-subtract',
          jobCounts: { active: 1, completed: 0, failed: 0, delayed: 0, waiting: 0, paused: 3 },
        },
      ]);
    });
  });

  describe('findFailedJobs', () => {
    it('answers the JSON of the failed jobs in the window and their total', async () => {
      ledgerQueue.getFailed.mockResolvedValue([
        { toJSON: () => ({ id: '7', name: '__default__' }) },
        { toJSON: () => ({ id: '8', name: '__default__', debounceId: 'd-8' }) },
      ] as never);
      ledgerQueue.getFailedCount.mockResolvedValue(21);

      const failed = await adapter.findFailedJobs({
        queueName: 'ledger-record',
        offset: 20,
        limit: 20,
      });

      expect(failed).toEqual([
        [
          { id: '7', name: '__default__', debounceId: null },
          { id: '8', name: '__default__', debounceId: 'd-8' },
        ],
        21,
      ]);
      expect(ledgerQueue.getFailed).toHaveBeenCalledWith(20, 39);
    });

    it('throws for a queue it does not hold', async () => {
      await expect(
        adapter.findFailedJobs({ queueName: 'unknown', offset: 0, limit: 20 }),
      ).rejects.toThrow('Queue unknown is not registered');
    });
  });

  describe('findJobState', () => {
    it('answers the state of the job', async () => {
      ledgerQueue.getJob.mockResolvedValue({
        getState: jest.fn().mockResolvedValue('failed'),
      } as never);

      const state = await adapter.findJobState({ queueName: 'ledger-record', jobId: '7' });

      expect(state).toBe('failed');
      expect(ledgerQueue.getJob).toHaveBeenCalledWith('7');
    });

    it('answers null for a job the queue does not hold', async () => {
      ledgerQueue.getJob.mockResolvedValue(null);

      const state = await adapter.findJobState({ queueName: 'ledger-record', jobId: '7' });

      expect(state).toBeNull();
    });
  });

  describe('retryJob', () => {
    it('retries the job', async () => {
      const retry = jest.fn().mockResolvedValue(undefined);

      ledgerQueue.getJob.mockResolvedValue({ retry } as never);

      await adapter.retryJob({ queueName: 'ledger-record', jobId: '7' });

      expect(retry).toHaveBeenCalledTimes(1);
    });

    it('does nothing for a job that is gone', async () => {
      ledgerQueue.getJob.mockResolvedValue(null);

      await expect(
        adapter.retryJob({ queueName: 'ledger-record', jobId: '7' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('removeJob', () => {
    it('removes the job', async () => {
      const remove = jest.fn().mockResolvedValue(undefined);

      ledgerQueue.getJob.mockResolvedValue({ remove } as never);

      await adapter.removeJob({ queueName: 'ledger-record', jobId: '7' });

      expect(remove).toHaveBeenCalledTimes(1);
    });

    it('does nothing for a job that is gone', async () => {
      ledgerQueue.getJob.mockResolvedValue(null);

      await expect(
        adapter.removeJob({ queueName: 'ledger-record', jobId: '7' }),
      ).resolves.toBeUndefined();
    });
  });
});
