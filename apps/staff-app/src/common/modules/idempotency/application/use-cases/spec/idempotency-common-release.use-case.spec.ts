import { IdempotencyCommonReleaseUseCase } from '../idempotency-common-release.use-case';

describe('IdempotencyCommonReleaseUseCase', () => {
  describe('execute', () => {
    it('deletes the key while it is still in flight', async () => {
      const deleteInFlight = jest.fn().mockResolvedValue(undefined);
      const useCase = new IdempotencyCommonReleaseUseCase({ deleteInFlight });

      await useCase.execute({ key: 'key-1' });

      expect(deleteInFlight).toHaveBeenCalledWith('key-1');
    });
  });
});
