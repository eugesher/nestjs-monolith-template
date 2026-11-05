import { QueueFailedJobService } from '../../services/queue-failed-job.service';
import { QueueRetryFailedJobUseCase } from '../queue-retry-failed-job.use-case';

describe('QueueRetryFailedJobUseCase', () => {
  let ensure: jest.Mock;
  let retryJob: jest.Mock;
  let useCase: QueueRetryFailedJobUseCase;

  beforeEach(() => {
    ensure = jest.fn().mockResolvedValue(undefined);
    retryJob = jest.fn().mockResolvedValue(undefined);
    useCase = new QueueRetryFailedJobUseCase({ ensure } as unknown as QueueFailedJobService, {
      has: jest.fn(),
      listJobCounts: jest.fn(),
      findFailedJobs: jest.fn(),
      findJobState: jest.fn(),
      retryJob,
      removeJob: jest.fn(),
    });
  });

  describe('execute', () => {
    it('retries the job once it is known to be failed', async () => {
      await useCase.execute({ queueName: 'ledger-record', jobId: '7' });

      expect(ensure).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(retryJob).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
    });

    it('retries nothing when the check refuses the job', async () => {
      ensure.mockRejectedValue(new Error('not failed'));

      await expect(useCase.execute({ queueName: 'ledger-record', jobId: '7' })).rejects.toThrow(
        'not failed',
      );
      expect(retryJob).not.toHaveBeenCalled();
    });
  });
});
