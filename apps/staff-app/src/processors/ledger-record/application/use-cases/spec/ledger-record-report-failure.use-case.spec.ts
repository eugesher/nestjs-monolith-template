import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { LedgerRecordReportFailureUseCase } from '../ledger-record-report-failure.use-case';

describe('LedgerRecordReportFailureUseCase', () => {
  let logger: PinoLoggerMock;
  let useCase: LedgerRecordReportFailureUseCase;

  beforeEach(() => {
    logger = makePinoLoggerMock();
    useCase = new LedgerRecordReportFailureUseCase(logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('logs a failed attempt with attempts left as a retry', () => {
      useCase.execute({
        operationKey: 'product-created:12',
        attempt: 1,
        attempts: 3,
        error: new Error('deadlock'),
      });

      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          operationKey: 'product-created:12',
          attempt: 1,
          attempts: 3,
        },
        'Ledger record failed, Bull retries the job',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the last failed attempt for a replay', () => {
      useCase.execute({
        operationKey: 'product-created:12',
        attempt: 3,
        attempts: 3,
        error: new Error('deadlock'),
      });

      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          operationKey: 'product-created:12',
          attempt: 3,
          attempts: 3,
        },
        'Ledger record failed permanently: the job stays in the failed set of the queue, replay it',
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
