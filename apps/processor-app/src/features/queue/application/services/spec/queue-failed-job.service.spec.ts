import { QueueFailedJobService } from '../queue-failed-job.service';

describe('QueueFailedJobService', () => {
  let has: jest.Mock;
  let findJobState: jest.Mock;
  let service: QueueFailedJobService;

  beforeEach(() => {
    has = jest.fn().mockReturnValue(true);
    findJobState = jest.fn().mockResolvedValue('failed');
    service = new QueueFailedJobService({
      has,
      findJobState,
      listJobCounts: jest.fn(),
      findFailedJobs: jest.fn(),
      retryJob: jest.fn(),
      removeJob: jest.fn(),
    });
  });

  describe('ensure', () => {
    it('passes a failed job of a known queue', async () => {
      await service.ensure({ queueName: 'ledger-record', jobId: '7' });

      expect(has).toHaveBeenCalledWith('ledger-record');
      expect(findJobState).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
    });

    it('refuses an unknown queue with QUEUE_NOT_FOUND', async () => {
      has.mockReturnValue(false);

      await expect(service.ensure({ queueName: 'unknown', jobId: '7' })).rejects.toMatchObject({
        code: 'QUEUE_NOT_FOUND',
        message: 'Queue unknown was not found',
      });
      expect(findJobState).not.toHaveBeenCalled();
    });

    it('refuses a missing job with QUEUE_JOB_NOT_FOUND', async () => {
      findJobState.mockResolvedValue(null);

      await expect(
        service.ensure({ queueName: 'ledger-record', jobId: '7' }),
      ).rejects.toMatchObject({
        code: 'QUEUE_JOB_NOT_FOUND',
        message: 'Job 7 was not found in queue ledger-record',
      });
    });

    it('refuses a job that is not failed with QUEUE_JOB_NOT_FAILED', async () => {
      findJobState.mockResolvedValue('waiting');

      await expect(
        service.ensure({ queueName: 'ledger-record', jobId: '7' }),
      ).rejects.toMatchObject({
        code: 'QUEUE_JOB_NOT_FAILED',
        message: 'Job 7 of queue ledger-record is waiting, not failed',
      });
    });
  });
});
