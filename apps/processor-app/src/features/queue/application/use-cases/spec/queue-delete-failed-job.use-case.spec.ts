import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { QueueDeleteFailedJobUseCase } from '../queue-delete-failed-job.use-case';
import type { QueueFailedJobService } from '../../services/queue-failed-job.service';

describe('QueueDeleteFailedJobUseCase', () => {
  let ensure: jest.Mock;
  let removeJob: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: QueueDeleteFailedJobUseCase;

  beforeEach(() => {
    ensure = jest.fn().mockResolvedValue(undefined);
    removeJob = jest.fn().mockResolvedValue({ record: { subjectId: '5' } });
    logger = makePinoLoggerMock();
    useCase = new QueueDeleteFailedJobUseCase(
      { ensure } as unknown as QueueFailedJobService,
      {
        has: jest.fn(),
        listJobCounts: jest.fn(),
        findFailedJobs: jest.fn(),
        findJobState: jest.fn(),
        retryJob: jest.fn(),
        removeJob,
      },
      logger as unknown as PinoLogger,
    );
  });

  describe('execute', () => {
    it('removes the job once it is known to be failed and logs its data and who removed it', async () => {
      await useCase.execute({ queueName: 'ledger-record', jobId: '7', staffUserId: '1' });

      expect(ensure).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(removeJob).toHaveBeenCalledWith({ queueName: 'ledger-record', jobId: '7' });
      expect(logger.warn).toHaveBeenCalledWith(
        {
          queueName: 'ledger-record',
          jobId: '7',
          staffUserId: '1',
          data: { record: { subjectId: '5' } },
        },
        'Failed job deleted',
      );
    });

    it('removes nothing when the check refuses the job', async () => {
      ensure.mockRejectedValue(new Error('not failed'));

      await expect(
        useCase.execute({ queueName: 'ledger-record', jobId: '7', staffUserId: '1' }),
      ).rejects.toThrow('not failed');
      expect(removeJob).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
