import { OrderModel } from '../order.model';

describe('OrderModel', () => {
  describe('reconstitute', () => {
    it('restores a stored order with its products', () => {
      const order = OrderModel.reconstitute({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        orderProducts: [
          { id: '600', productId: '100', product: { sku: 'SKU-0001', name: 'Lamp' } },
        ],
      });

      expect(order.id).toBe('600');
      expect(order.createdAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
      expect(order.products).toEqual([
        { id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
      ]);
    });
  });

  describe('createDraft', () => {
    it('drafts one product per requested unit in the request order', () => {
      const draft = OrderModel.createDraft({
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
        products: [{ id: '100' }, { id: '103' }],
        stock: [
          { productId: '100', quantity: 2 },
          { productId: '103', quantity: 3 },
        ],
      });

      expect(draft).toEqual({ customerId: 'customer-1', productIds: ['100', '103', '100'] });
    });

    it('refuses an empty order with ORDER_EMPTY', () => {
      expect(() =>
        OrderModel.createDraft({
          customerId: 'customer-1',
          productIds: [],
          products: [],
          stock: [],
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_EMPTY',
          message: 'An order must contain at least one product',
        }) as Error,
      );
    });

    it('refuses a product that is not active with ORDER_PRODUCT_NOT_FOUND', () => {
      expect(() =>
        OrderModel.createDraft({
          customerId: 'customer-1',
          productIds: ['999'],
          products: [],
          stock: [{ productId: '999', quantity: 5 }],
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_PRODUCT_NOT_FOUND',
          message: 'Product 999 was not found',
          details: { productId: '999' },
        }) as Error,
      );
    });

    it('refuses more units than in stock with ORDER_STOCK_INSUFFICIENT', () => {
      expect(() =>
        OrderModel.createDraft({
          customerId: 'customer-1',
          productIds: ['100', '100', '100'],
          products: [{ id: '100' }],
          stock: [{ productId: '100', quantity: 2 }],
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_STOCK_INSUFFICIENT',
          message: 'Product 100 has 2 in stock, 3 requested',
          details: { productId: '100', requested: 3, available: 2 },
        }) as Error,
      );
    });

    it('counts a product without stock data as zero in stock', () => {
      expect(() =>
        OrderModel.createDraft({
          customerId: 'customer-1',
          productIds: ['100'],
          products: [{ id: '100' }],
          stock: [],
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_STOCK_INSUFFICIENT',
          details: { productId: '100', requested: 1, available: 0 },
        }) as Error,
      );
    });

    it('accepts exactly the units in stock', () => {
      const draft = OrderModel.createDraft({
        customerId: 'customer-1',
        productIds: ['100', '100'],
        products: [{ id: '100' }],
        stock: [{ productId: '100', quantity: 2 }],
      });

      expect(draft.productIds).toEqual(['100', '100']);
    });
  });

  describe('getMovements', () => {
    it('turns every ordered product into a movement of its order product', () => {
      const order = OrderModel.reconstitute({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        orderProducts: [
          { id: '601', productId: '100', product: { sku: 'SKU-0001', name: 'Lamp' } },
          { id: '602', productId: '100', product: { sku: 'SKU-0001', name: 'Lamp' } },
        ],
      });

      expect(order.getMovements()).toEqual([
        { productId: '100', orderProductId: '601' },
        { productId: '100', orderProductId: '602' },
      ]);
    });
  });

  describe('toView', () => {
    it('maps a stored order with its products', () => {
      const order = OrderModel.reconstitute({
        id: '600',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        orderProducts: [
          { id: '601', productId: '100', product: { sku: 'SKU-0001', name: 'Lamp' } },
        ],
      });

      expect(order.toView()).toEqual({
        id: '600',
        createdAt: '2026-01-03T00:00:00.000Z',
        products: [{ id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });
    });
  });
});
