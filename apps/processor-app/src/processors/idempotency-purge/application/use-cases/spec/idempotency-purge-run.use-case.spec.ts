import { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock, PinoLoggerMock } from '@acme-libs/observability/testing';
import { IdempotencyPurgeRunUseCase } from '../idempotency-purge-run.use-case';

describe('IdempotencyPurgeRunUseCase', () => {
  let purgeExpired: jest.Mock;
  let logger: PinoLoggerMock;
  let useCase: IdempotencyPurgeRunUseCase;

  beforeEach(() => {
    purgeExpired = jest.fn().mockResolvedValue(undefined);
    logger = makePinoLoggerMock();
    useCase = new IdempotencyPurgeRunUseCase({ purgeExpired }, 24, logger as unknown as PinoLogger);
  });

  describe('execute', () => {
    it('purges the keys older than the TTL and leaves the outcome log to the core module', async () => {
      await useCase.execute();

      expect(purgeExpired.mock.calls).toEqual([[24]]);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('skips a tick that arrives while the previous purge is still running', async () => {
      let finish: () => void = () => undefined;

      purgeExpired.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
      );

      const first = useCase.execute();

      await useCase.execute();
      finish();
      await first;

      expect(purgeExpired).toHaveBeenCalledTimes(1);
      expect(logger.info.mock.calls).toEqual([
        [{}, 'Idempotency purge still running, this tick is skipped'],
      ]);
    });

    it('purges again on the tick after the previous purge finished', async () => {
      await useCase.execute();
      await useCase.execute();

      expect(purgeExpired).toHaveBeenCalledTimes(2);
      expect(logger.info).not.toHaveBeenCalled();
    });

    it('logs a failed purge as a warning instead of throwing', async () => {
      const error = new Error('database is down');

      purgeExpired.mockRejectedValue(error);

      await useCase.execute();

      expect(logger.warn.mock.calls).toEqual([
        [{ err: error }, 'Idempotency purge failed, the next tick retries'],
      ]);
    });

    it('purges again on the tick after a failed purge', async () => {
      purgeExpired.mockRejectedValueOnce(new Error('database is down'));

      await useCase.execute();
      await useCase.execute();

      expect(purgeExpired).toHaveBeenCalledTimes(2);
      expect(logger.info).not.toHaveBeenCalled();
    });
  });
});
