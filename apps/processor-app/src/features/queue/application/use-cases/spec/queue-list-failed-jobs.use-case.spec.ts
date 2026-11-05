import { QueueListFailedJobsUseCase } from '../queue-list-failed-jobs.use-case';

describe('QueueListFailedJobsUseCase', () => {
  let has: jest.Mock;
  let findFailedJobs: jest.Mock;
  let useCase: QueueListFailedJobsUseCase;

  beforeEach(() => {
    has = jest.fn().mockReturnValue(true);
    findFailedJobs = jest.fn().mockResolvedValue([[], 0]);
    useCase = new QueueListFailedJobsUseCase({
      has,
      listJobCounts: jest.fn(),
      findFailedJobs,
      findJobState: jest.fn(),
      retryJob: jest.fn(),
      removeJob: jest.fn(),
    });
  });

  describe('execute', () => {
    it('answers a page of the failed jobs for the clamped window', async () => {
      findFailedJobs.mockResolvedValue([[{ id: '7', name: '__default__' }], 21]);

      const page = await useCase.execute({ queueName: 'ledger-record', page: 2, limit: 20 });

      expect(page).toEqual({
        page: 2,
        count: 1,
        pageCount: 2,
        total: 21,
        data: [{ id: '7', name: '__default__' }],
      });
      expect(findFailedJobs).toHaveBeenCalledWith({
        queueName: 'ledger-record',
        offset: 20,
        limit: 20,
      });
    });

    it('starts at the first page of 20 jobs by default', async () => {
      await useCase.execute({ queueName: 'ledger-record' });

      expect(findFailedJobs).toHaveBeenCalledWith({
        queueName: 'ledger-record',
        offset: 0,
        limit: 20,
      });
    });

    it('refuses an unknown queue with QUEUE_NOT_FOUND', async () => {
      has.mockReturnValue(false);

      await expect(useCase.execute({ queueName: 'unknown' })).rejects.toMatchObject({
        code: 'QUEUE_NOT_FOUND',
      });
      expect(findFailedJobs).not.toHaveBeenCalled();
    });
  });
});
