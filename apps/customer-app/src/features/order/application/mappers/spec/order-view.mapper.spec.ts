import { ProductStatusEnum } from '@acme-libs/kernel';
import { OrderModel } from '../../../domain';
import { OrderViewMapper } from '../order-view.mapper';

describe('OrderViewMapper', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date('2026-01-05T08:00:00.000Z') });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('toView', () => {
    it('maps a stored order with its products', () => {
      const view = OrderViewMapper.toView(
        OrderModel.reconstitute({
          id: '600',
          customerId: 'customer-1',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
          products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
        }),
      );

      expect(view).toEqual({
        id: '600',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });

    it('fills the ids and the creation time of an unsaved order', () => {
      const view = OrderViewMapper.toView(
        OrderModel.place({
          customerId: 'customer-1',
          productIds: ['100'],
          stock: [
            {
              productId: '100',
              sku: 'SKU-0001',
              name: 'Lamp',
              status: ProductStatusEnum.ACTIVE,
              quantity: 1,
            },
          ],
        }),
      );

      expect(view).toEqual({
        id: '',
        createdAt: '2026-01-05T08:00:00.000Z',
        products: [{ id: '', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });
  });

  describe('toSummaryView', () => {
    it('maps a listed order without its products', () => {
      const view = OrderViewMapper.toSummaryView({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      });

      expect(view).toEqual({ id: '600', createdAt: '2026-01-03T00:00:00.000Z' });
    });
  });
});
