import { QueueListUseCase } from '../queue-list.use-case';

describe('QueueListUseCase', () => {
  let listJobCounts: jest.Mock;
  let useCase: QueueListUseCase;

  beforeEach(() => {
    listJobCounts = jest.fn();
    useCase = new QueueListUseCase({
      has: jest.fn(),
      listJobCounts,
      findFailedJobs: jest.fn(),
      findJobState: jest.fn(),
      retryJob: jest.fn(),
      removeJob: jest.fn(),
    });
  });

  describe('execute', () => {
    it('answers the queues with their job counts', async () => {
      listJobCounts.mockResolvedValue([
        {
          name: 'ledger-record',
          jobCounts: { active: 0, completed: 0, failed: 2, delayed: 0, waiting: 1 },
        },
      ]);

      const queues = await useCase.execute();

      expect(queues).toEqual([
        {
          name: 'ledger-record',
          jobCounts: { active: 0, completed: 0, failed: 2, delayed: 0, waiting: 1 },
        },
      ]);
    });
  });
});
