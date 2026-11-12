import { IdempotencyCoreReleaseUseCase } from '../idempotency-core-release.use-case';

describe('IdempotencyCoreReleaseUseCase', () => {
  describe('execute', () => {
    it('deletes the key of the scope while it is still in flight', async () => {
      const deleteInFlight = jest.fn().mockResolvedValue(undefined);
      const useCase = new IdempotencyCoreReleaseUseCase({ deleteInFlight });

      await useCase.execute({ scope: 'customer:101', key: 'key-1' });

      expect(deleteInFlight).toHaveBeenCalledWith({ scope: 'customer:101', key: 'key-1' });
    });
  });
});
