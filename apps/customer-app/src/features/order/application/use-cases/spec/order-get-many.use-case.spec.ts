import { OrderGetManyUseCase } from '../order-get-many.use-case';

describe('OrderGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: OrderGetManyUseCase;

  beforeEach(() => {
    list = jest
      .fn()
      .mockResolvedValue([[{ id: '600', createdAt: new Date('2026-01-03T00:00:00.000Z') }], 1]);
    useCase = new OrderGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('lists the orders of the customer in the default window', async () => {
      const page = await useCase.execute({
        customerId: 'customer-1',
        page: undefined,
        limit: undefined,
      });

      expect(list).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        customerId: 'customer-1',
      });
      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '600', createdAt: '2026-01-03T00:00:00.000Z' }],
      });
    });

    it('clamps the page limit to 100', async () => {
      await useCase.execute({ customerId: 'customer-1', page: 3, limit: 500 });

      expect(list).toHaveBeenCalledWith({
        limit: 100,
        offset: 200,
        customerId: 'customer-1',
      });
    });
  });
});
