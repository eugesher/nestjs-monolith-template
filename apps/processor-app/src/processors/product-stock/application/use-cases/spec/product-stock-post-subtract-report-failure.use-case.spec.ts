import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, type PinoLoggerMock } from '@acme-libs/testing';

import { ProductStockPostSubtractReportFailureUseCase } from '../product-stock-post-subtract-report-failure.use-case';

describe('ProductStockPostSubtractReportFailureUseCase', () => {
  let logger: PinoLoggerMock;
  let useCase: ProductStockPostSubtractReportFailureUseCase;

  beforeEach(() => {
    logger = makePinoLoggerMock();
    useCase = new ProductStockPostSubtractReportFailureUseCase(logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('logs a failed attempt with attempts left as a retry', () => {
      useCase.execute({
        productIds: ['100', '106'],
        attempt: 1,
        attempts: 3,
        error: new Error('deadlock'),
      });

      expect(logger.warn).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          productIds: ['100', '106'],
          attempt: 1,
          attempts: 3,
        },
        'Post-subtract check failed, Bull retries the job',
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('logs the last failed attempt for a replay', () => {
      useCase.execute({
        productIds: ['100', '106'],
        attempt: 3,
        attempts: 3,
        error: new Error('deadlock'),
      });

      expect(logger.error).toHaveBeenCalledWith(
        {
          err: new Error('deadlock'),
          productIds: ['100', '106'],
          attempt: 3,
          attempts: 3,
        },
        'Post-subtract check failed permanently: the job stays in the failed set of the queue, replay it',
      );
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
