import { OrderModel } from '../order.model';

describe('OrderModel', () => {
  describe('toSnapshot', () => {
    it('answers a found order with its owner and its products', () => {
      const order = OrderModel.reconstitute({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        orderProducts: [
          { id: '601', productId: '100', product: { sku: 'SKU-0001', name: 'Lamp' } },
        ],
      });

      expect(order.toSnapshot()).toEqual({
        id: '600',
        customerId: 'customer-1',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });
  });
});
