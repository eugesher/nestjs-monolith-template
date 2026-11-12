import { IdempotencyCoreCompleteUseCase } from '../idempotency-core-complete.use-case';

describe('IdempotencyCoreCompleteUseCase', () => {
  describe('execute', () => {
    it('stores the response as JSON under the key of the scope', async () => {
      const complete = jest.fn().mockResolvedValue(undefined);
      const useCase = new IdempotencyCoreCompleteUseCase({ complete });

      await useCase.execute({
        scope: 'customer:101',
        key: 'key-1',
        response: { id: '12', sku: 'A-1' },
      });

      expect(complete).toHaveBeenCalledWith({
        scope: 'customer:101',
        key: 'key-1',
        responseBody: '{"id":"12","sku":"A-1"}',
      });
    });
  });
});
