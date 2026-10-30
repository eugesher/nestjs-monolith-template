import { OrderModel } from '../../../domain';
import { OrderGetOneUseCase } from '../order-get-one.use-case';

describe('OrderGetOneUseCase', () => {
  let findById: jest.Mock;
  let useCase: OrderGetOneUseCase;

  beforeEach(() => {
    findById = jest.fn().mockResolvedValue(
      OrderModel.reconstitute({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      }),
    );
    useCase = new OrderGetOneUseCase({ list: jest.fn(), findById });
  });

  describe('execute', () => {
    it('returns an own order with its products', async () => {
      const view = await useCase.execute({ customerId: 'customer-1', orderId: '600' });

      expect(findById).toHaveBeenCalledWith('600');
      expect(view).toEqual({
        id: '600',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });

    it('hides an order of another customer behind ORDER_NOT_FOUND', async () => {
      await expect(
        useCase.execute({ customerId: 'customer-2', orderId: '600' }),
      ).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND', message: 'Order 600 was not found' });
    });

    it('refuses a missing order with ORDER_NOT_FOUND', async () => {
      findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ customerId: 'customer-1', orderId: '999' }),
      ).rejects.toMatchObject({ code: 'ORDER_NOT_FOUND', message: 'Order 999 was not found' });
    });
  });
});
