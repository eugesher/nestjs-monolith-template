import { OrderGetManyUseCase } from '../order-get-many.use-case';

describe('OrderGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: OrderGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue({
      items: [{ id: '600', createdAt: new Date('2026-01-03T00:00:00.000Z') }],
      total: 1,
      page: 1,
      size: 20,
    });
    useCase = new OrderGetManyUseCase({ list, findById: jest.fn() });
  });

  describe('execute', () => {
    it('lists the orders of the customer in the default window', async () => {
      const page = await useCase.execute({
        customerId: 'customer-1',
        page: undefined,
        size: undefined,
      });

      expect(list).toHaveBeenCalledWith({ page: 1, size: 20, customerId: 'customer-1' });
      expect(page).toEqual({
        items: [{ id: '600', createdAt: '2026-01-03T00:00:00.000Z' }],
        total: 1,
        page: 1,
        size: 20,
      });
    });

    it('clamps the page size to 100', async () => {
      await useCase.execute({ customerId: 'customer-1', page: 3, size: 500 });

      expect(list).toHaveBeenCalledWith({ page: 3, size: 100, customerId: 'customer-1' });
    });
  });
});
