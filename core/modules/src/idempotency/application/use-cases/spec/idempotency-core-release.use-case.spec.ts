import type { PinoLogger } from 'nestjs-pino';

import { makePinoLoggerMock } from '@acme-libs/testing';

import { IdempotencyCoreReleaseUseCase } from '../idempotency-core-release.use-case';

describe('IdempotencyCoreReleaseUseCase', () => {
  describe('execute', () => {
    it('deletes the key of the scope while it is still in flight and logs the release', async () => {
      const deleteInFlight = jest.fn().mockResolvedValue(undefined);
      const logger = makePinoLoggerMock();
      const useCase = new IdempotencyCoreReleaseUseCase(
        { deleteInFlight },
        logger as unknown as PinoLogger,
      );

      await useCase.execute({ scope: 'customer:101', key: 'key-1' });

      expect(deleteInFlight).toHaveBeenCalledWith({ scope: 'customer:101', key: 'key-1' });
      expect(logger.info).toHaveBeenCalledWith(
        { scope: 'customer:101', key: 'key-1' },
        'Idempotency claim released',
      );
    });
  });
});
