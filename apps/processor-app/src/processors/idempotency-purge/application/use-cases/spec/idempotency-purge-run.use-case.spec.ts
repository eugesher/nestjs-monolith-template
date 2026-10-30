import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { IdempotencyPurgeRunUseCase } from '../idempotency-purge-run.use-case';

describe('IdempotencyPurgeRunUseCase', () => {
  let deleteCreatedBefore: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: IdempotencyPurgeRunUseCase;

  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-02T12:00:00.000Z') });
    deleteCreatedBefore = jest.fn().mockResolvedValue(3);
    logger = makePinoLoggerMock();
    useCase = new IdempotencyPurgeRunUseCase(
      { deleteCreatedBefore },
      24,
      logger as unknown as PinoLogger,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('execute', () => {
    it('deletes the keys created more than the TTL ago', async () => {
      await useCase.execute();

      expect(deleteCreatedBefore.mock.calls).toEqual([[new Date('2026-01-01T12:00:00.000Z')]]);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('logs the cutoff, the count and the TTL', async () => {
      await useCase.execute();

      expect(logger.info.mock.calls).toEqual([
        [
          { cutoff: '2026-01-01T12:00:00.000Z', removed: 3, ttlHours: 24 },
          'Expired idempotency keys purged',
        ],
      ]);
    });

    it('skips a tick that arrives while the previous purge is still running', async () => {
      let finish: (removed: number) => void = () => undefined;

      deleteCreatedBefore.mockReturnValueOnce(
        new Promise<number>((resolve) => {
          finish = resolve;
        }),
      );

      const first = useCase.execute();

      await useCase.execute();
      finish(0);
      await first;

      expect(deleteCreatedBefore).toHaveBeenCalledTimes(1);
      expect(logger.info.mock.calls[0]).toEqual([
        {},
        'Idempotency purge still running, this tick is skipped',
      ]);
    });

    it('purges again on the tick after the previous purge finished', async () => {
      await useCase.execute();
      await useCase.execute();

      expect(deleteCreatedBefore).toHaveBeenCalledTimes(2);
    });

    it('logs a failed purge as a warning instead of throwing', async () => {
      const error = new Error('database is down');

      deleteCreatedBefore.mockRejectedValue(error);

      await useCase.execute();

      expect(logger.warn.mock.calls).toEqual([
        [{ err: error }, 'Idempotency purge failed, the next tick retries'],
      ]);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('purges again on the tick after a failed purge', async () => {
      deleteCreatedBefore.mockRejectedValueOnce(new Error('database is down'));

      await useCase.execute();
      await useCase.execute();

      expect(deleteCreatedBefore).toHaveBeenCalledTimes(2);
    });
  });
});
