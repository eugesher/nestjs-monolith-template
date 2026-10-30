import { OrderGetOneUseCase } from '../order-get-one.use-case';

describe('OrderGetOneUseCase', () => {
  let findById: jest.Mock;
  let useCase: OrderGetOneUseCase;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue({
      id: '600',
      customerId: 'customer-1',
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
      products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
    });
    useCase = new OrderGetOneUseCase({ list: jest.fn(), findById });
  });

  describe('execute', () => {
    it('returns the order of any customer with its products', async () => {
      const view = await useCase.execute({ orderId: '600' });

      expect(findById).toHaveBeenCalledWith('600');
      expect(view).toEqual({
        id: '600',
        customerId: 'customer-1',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });

    it('refuses a missing order with ORDER_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(useCase.execute({ orderId: '999' })).rejects.toMatchObject({
        code: 'ORDER_NOT_FOUND',
        message: 'Order 999 was not found',
      });
    });
  });
});
