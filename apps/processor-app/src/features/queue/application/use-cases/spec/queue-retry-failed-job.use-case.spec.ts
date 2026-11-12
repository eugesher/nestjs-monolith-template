import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { QueueRetryFailedJobUseCase } from '../queue-retry-failed-job.use-case';
import type { QueueFailedJobService } from '../../services/queue-failed-job.service';

describe('QueueRetryFailedJobUseCase', () => {
  let ensure: jest.Mock;
  let retryJob: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: QueueRetryFailedJobUseCase;

  beforeEach(() => {
    ensure = jest.fn().mockResolvedValue(undefined);
    retryJob = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new QueueRetryFailedJobUseCase(
      { ensure } as unknown as QueueFailedJobService,
      {
        has: jest.fn(),
        listJobCounts: jest.fn(),
        findFailedJobs: jest.fn(),
        findJobState: jest.fn(),
        retryJob,
        removeJob: jest.fn(),
      },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('retries the job once it is known to be failed and logs who retried it', async () => {
      await useCase.execute({ queueName: 'ledger-record', jobId: '7', staffUserId: '1' });

      expect(ensure).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(retryJob).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(logger.info).toHaveBeenCalledWith(
        { queueName: 'ledger-record', jobId: '7', staffUserId: '1' },
        'Failed job returned to the queue',
      );
    });

    it('retries nothing when the check refuses the job', async () => {
      ensure.mockRejectedValue(new Error('not failed'));

      await expect(
        useCase.execute({ queueName: 'ledger-record', jobId: '7', staffUserId: '1' }),
      ).rejects.toThrow('not failed');
      expect(retryJob).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
