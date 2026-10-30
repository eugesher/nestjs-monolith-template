import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { IdempotencyCorePurgeExpiredUseCase } from '../idempotency-core-purge-expired.use-case';

describe('IdempotencyCorePurgeExpiredUseCase', () => {
  let deleteCreatedBefore: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: IdempotencyCorePurgeExpiredUseCase;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-02T12:00:00.000Z') });
    deleteCreatedBefore = jest.fn().mockResolvedValue(3);
    logger = makePinoLoggerMock();
    useCase = new IdempotencyCorePurgeExpiredUseCase(
      { deleteCreatedBefore },
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('deletes the keys created more than the TTL ago and answers how many', async () => {
      const view = await useCase.execute({ ttlHours: 24 });

      expect(view).toEqual({ removed: 3 });
      expect(deleteCreatedBefore).toHaveBeenCalledWith(new Date('2026-01-01T12:00:00.000Z'));
    });

    it('logs the cutoff, the count and the TTL', async () => {
      await useCase.execute({ ttlHours: 24 });

      expect(logger.info).toHaveBeenCalledWith(
        { cutoff: '2026-01-01T12:00:00.000Z', removed: 3, ttlHours: 24 },
        'Expired idempotency keys purged',
      );
    });
  });
});
