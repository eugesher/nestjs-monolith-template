import { OrderModel } from '../../../domain';
import { OrderGetOneUseCase } from '../order-get-one.use-case';

describe('OrderGetOneUseCase', () => {
  let findOwned: jest.Mock;
  let useCase: OrderGetOneUseCase;

  beforeEach(() => {
    findOwned = jest.fn().mockResolvedValue(
      OrderModel.reconstitute({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      }),
    );
    useCase = new OrderGetOneUseCase({ list: jest.fn(), findOwned });
  });

  describe('execute', () => {
    it('returns an own order with its products', async () => {
      const view = await useCase.execute({ customerId: 'customer-1', orderId: '600' });

      expect(findOwned).toHaveBeenCalledWith({ orderId: '600', customerId: 'customer-1' });
      expect(view).toEqual({
        id: '600',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });

    it('refuses an order not found for the customer with ORDER_NOT_FOUND', async () => {
      findOwned.mockResolvedValue(null);

      await expect(
        useCase.execute({ customerId: 'customer-1', orderId: '999' }),
      ).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND', message: 'Order 999 was not found' });
    });
  });
});
