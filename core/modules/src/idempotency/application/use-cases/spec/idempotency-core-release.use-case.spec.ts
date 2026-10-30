import { IdempotencyCoreReleaseUseCase } from '../idempotency-core-release.use-case';

describe('IdempotencyCoreReleaseUseCase', () => {
  describe('execute', () => {
    it('deletes the key while it is still in flight', async () => {
      const deleteInFlight = jest.fn().mockResolvedValue(undefined);
      const useCase = new IdempotencyCoreReleaseUseCase({ deleteInFlight });

      await useCase.execute({ key: 'key-1' });

      expect(deleteInFlight).toHaveBeenCalledWith('key-1');
    });
  });
});
