import { OrderGetManyUseCase } from '../order-get-many.use-case';

describe('OrderGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: OrderGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue({
      page: 1,
      count: 1,
      pageCount: 1,
      total: 1,
      data: [
        { id: '600', customerId: 'customer-1', createdAt: new Date('2026-01-03T00:00:00.000Z') },
      ],
    });
    useCase = new OrderGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('lists the orders of all customers in the default window', async () => {
      const page = await useCase.execute({ page: undefined, limit: undefined });

      expect(list).toHaveBeenCalledWith({ page: 1, limit: 20, offset: 0 });
      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '600', customerId: 'customer-1', createdAt: '2026-01-03T00:00:00.000Z' }],
      });
    });

    it('clamps the page limit to 100', async () => {
      await useCase.execute({ page: 3, limit: 500 });

      expect(list).toHaveBeenCalledWith({ page: 3, limit: 100, offset: 200 });
    });
  });
});
