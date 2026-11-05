import { QueueFailedJobService } from '../../services/queue-failed-job.service';
import { QueueDeleteFailedJobUseCase } from '../queue-delete-failed-job.use-case';

describe('QueueDeleteFailedJobUseCase', () => {
  let ensure: jest.Mock;
  let removeJob: jest.Mock;
  let useCase: QueueDeleteFailedJobUseCase;

  beforeEach(() => {
    ensure = jest.fn().mockResolvedValue(undefined);
    removeJob = jest.fn().mockResolvedValue(undefined);
    useCase = new QueueDeleteFailedJobUseCase({ ensure } as unknown as QueueFailedJobService, {
      has: jest.fn(),
      listJobCounts: jest.fn(),
      findFailedJobs: jest.fn(),
      findJobState: jest.fn(),
      retryJob: jest.fn(),
      removeJob,
    });
  });

  describe('execute', () => {
    it('removes the job once it is known to be failed', async () => {
      await useCase.execute({ queueName: 'ledger-record', jobId: '7' });

      expect(ensure).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(removeJob).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
    });

    it('removes nothing when the check refuses the job', async () => {
      ensure.mockRejectedValue(new Error('not failed'));

      await expect(useCase.execute({ queueName: 'ledger-record', jobId: '7' })).rejects.toThrow(
        'not failed',
      );
      expect(removeJob).not.toHaveBeenCalled();
    });
  });
});
