import { Order } from '@acme-core/entities';
import { OrderMapper } from '../order.mapper';

describe('OrderMapper', () => {
  describe('toModel', () => {
    it('reconstitutes the order with its product lines', () => {
      const order = Object.assign(new Order(), {
        id: '600',
        customerId: '00000000-0000-4000-8000-000000000101',
        createdAt: new Date('2026-01-05T08:00:00.000Z'),
      });

      const model = OrderMapper.toModel(order, [
        { id: '900', productId: '100', sku: 'SKU-0001', name: 'Reference product' },
      ]);

      expect(model.id).toBe('600');
      expect(model.customerId).toBe('00000000-0000-4000-8000-000000000101');
      expect(model.createdAt).toEqual(new Date('2026-01-05T08:00:00.000Z'));
      expect(model.products).toEqual([
        { id: '900', productId: '100', sku: 'SKU-0001', name: 'Reference product' },
      ]);
    });
  });
});
