import { OrderGetManyUseCase } from '../order-get-many.use-case';

describe('OrderGetManyUseCase', () => {
  let list: jest.Mock;
  let findOrderIds: jest.Mock;
  let useCase: OrderGetManyUseCase;

  beforeEach(() => {
    list = jest
      .fn()
      .mockResolvedValue([
        [{ id: '600', customerId: 'customer-1', createdAt: new Date('2026-01-03T00:00:00.000Z') }],
        1,
      ]);
    findOrderIds = jest.fn().mockResolvedValue(['600']);
    useCase = new OrderGetManyUseCase(
      { list },
      { find: jest.fn(), replace: jest.fn(), findOrderIds },
    );
  });

  describe('execute', () => {
    it('lists the orders of all customers in the default window', async () => {
      const page = await useCase.execute({ page: undefined, limit: undefined, tagId: undefined });

      expect(list).toHaveBeenCalledWith({ limit: 20, offset: 0, orderIds: undefined });
      expect(findOrderIds).not.toHaveBeenCalled();
      expect(page).toEqual({
        page: 1,
        count: 1,
        pageCount: 1,
        total: 1,
        data: [{ id: '600', customerId: 'customer-1', createdAt: '2026-01-03T00:00:00.000Z' }],
      });
    });

    it('clamps the page limit to 100', async () => {
      await useCase.execute({ page: 3, limit: 500, tagId: undefined });

      expect(list).toHaveBeenCalledWith({ limit: 100, offset: 200, orderIds: undefined });
    });

    it('lists only the orders that carry the tag', async () => {
      await useCase.execute({ page: undefined, limit: undefined, tagId: '302' });

      expect(findOrderIds).toHaveBeenCalledWith({ tagId: '302' });
      expect(list).toHaveBeenCalledWith({ limit: 20, offset: 0, orderIds: ['600'] });
    });

    it('answers an empty page without a query when no order carries the tag', async () => {
      findOrderIds.mockResolvedValue([]);

      const page = await useCase.execute({ page: undefined, limit: undefined, tagId: '302' });

      expect(list).not.toHaveBeenCalled();
      expect(page).toEqual({ page: 1, count: 0, pageCount: 0, total: 0, data: [] });
    });
  });
});
