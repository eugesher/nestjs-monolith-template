import { OrderViewMapper } from '../order-view.mapper';

describe('OrderViewMapper', () => {
  describe('toGetOneView', () => {
    it('maps a found order with its owner and its products', () => {
      const view = OrderViewMapper.toGetOneView({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });

      expect(view).toEqual({
        id: '600',
        customerId: 'customer-1',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });
  });

  describe('toGetManyViewItem', () => {
    it('maps a listed order with its owner and without its products', () => {
      const view = OrderViewMapper.toGetManyViewItem({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });

      expect(view).toEqual({
        id: '600',
        customerId: 'customer-1',
        createdAt: '2026-01-03T00:00:00.000Z',
      });
    });
  });
});
