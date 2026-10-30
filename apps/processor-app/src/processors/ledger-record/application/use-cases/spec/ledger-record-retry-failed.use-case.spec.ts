import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerRecordRetryFailedUseCase } from '../ledger-record-retry-failed.use-case';

describe('LedgerRecordRetryFailedUseCase', () => {
  let retryFailed: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: LedgerRecordRetryFailedUseCase;

  beforeEach(() => {
    retryFailed = jest.fn().mockResolvedValue(0);
    logger = makePinoLoggerMock();
    useCase = new LedgerRecordRetryFailedUseCase({ retryFailed }, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('retries the failed records and logs how many went back to the queue in one line', async () => {
      retryFailed.mockResolvedValue(3);

      await useCase.execute();

      expect(retryFailed.mock.calls).toEqual([[]]);
      expect(logger.info.mock.calls).toEqual([
        [{ retried: 3 }, 'Failed ledger records are back in the queue'],
      ]);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('logs the line when no record failed', async () => {
      await useCase.execute();

      expect(logger.info.mock.calls).toEqual([
        [{ retried: 0 }, 'Failed ledger records are back in the queue'],
      ]);
    });

    it('logs a failed retry as a warning instead of throwing', async () => {
      const error = new Error('redis is down');

      retryFailed.mockRejectedValue(error);

      await useCase.execute();

      expect(logger.warn.mock.calls).toEqual([
        [{ err: error }, 'Ledger record retry failed, the next tick retries'],
      ]);
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
