import { QueueController } from '../queue.controller';
import type {
  QueueDeleteFailedJobUseCase,
  QueueListFailedJobsUseCase,
  QueueListUseCase,
  QueueRetryFailedJobUseCase,
} from '../../../application';

describe('QueueController', () => {
  let list: jest.Mock;
  let listFailedJobs: jest.Mock;
  let retryFailedJob: jest.Mock;
  let deleteFailedJob: jest.Mock;
  let controller: QueueController;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue([]);
    listFailedJobs = jest.fn().mockResolvedValue({
      page: 1,
      count: 0,
      pageCount: 0,
      total: 0,
      data: [],
    });
    retryFailedJob = jest.fn().mockResolvedValue(undefined);
    deleteFailedJob = jest.fn().mockResolvedValue(undefined);
    controller = new QueueController(
      { execute: list } as unknown as QueueListUseCase,
      { execute: listFailedJobs } as unknown as QueueListFailedJobsUseCase,
      { execute: retryFailedJob } as unknown as QueueRetryFailedJobUseCase,
      { execute: deleteFailedJob } as unknown as QueueDeleteFailedJobUseCase,
    );
  });

  describe('handleList', () => {
    it('answers the queues of the use case', async () => {
      const response = await controller.handleList();

      expect(response).toEqual([]);
      expect(list).toHaveBeenCalledWith();
    });
  });

  describe('handleListFailedJobs', () => {
    it('answers the page for the queue of the path and the window of the query string', async () => {
      const response = await controller.handleListFailedJobs(
        { queueName: 'ledger-record' },
        { page: 2, limit: 10 },
      );

      expect(response).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
      expect(listFailedJobs).toHaveBeenCalledWith({
        queueName: 'ledger-record',
        page: 2,
        limit: 10,
      });
    });
  });

  describe('handleRetryFailedJob', () => {
    it('retries the job of the path on behalf of the current user', async () => {
      await controller.handleRetryFailedJob(
        { queueName: 'ledger-record', jobId: '7' },
        { id: '1', email: 'admin@example.com' },
      );

      expect(retryFailedJob).toHaveBeenCalledWith({
        queueName: 'ledger-record',
        jobId: '7',
        staffUserId: '1',
      });
    });

    it('lets a failed retry reject', async () => {
      retryFailedJob.mockRejectedValue(new Error('job is not failed'));

      const retry = controller.handleRetryFailedJob(
        { queueName: 'ledger-record', jobId: '7' },
        { id: '1', email: 'admin@example.com' },
      );

      await expect(retry).rejects.toThrow('job is not failed');
    });
  });

  describe('handleDeleteFailedJob', () => {
    it('deletes the job of the path on behalf of the current user', async () => {
      await controller.handleDeleteFailedJob(
        { queueName: 'ledger-record', jobId: '7' },
        { id: '1', email: 'admin@example.com' },
      );

      expect(deleteFailedJob).toHaveBeenCalledWith({
        queueName: 'ledger-record',
        jobId: '7',
        staffUserId: '1',
      });
    });
  });
});
