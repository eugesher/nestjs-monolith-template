import { ProductStatusEnum } from '@acme-libs/kernel';
import { OrderModel } from '../order.model';

describe('OrderModel', () => {
  describe('place', () => {
    it('places one product per requested unit in the request order', () => {
      const order = OrderModel.place({
        customerId: 'customer-1',
        productIds: ['100', '103', '100'],
        stock: [
          {
            productId: '100',
            sku: 'SKU-0001',
            name: 'Lamp',
            status: ProductStatusEnum.ACTIVE,
            quantity: 2,
          },
          {
            productId: '103',
            sku: 'SKU-0004',
            name: 'Chair',
            status: ProductStatusEnum.ACTIVE,
            quantity: 3,
          },
        ],
      });

      expect(order.id).toBeUndefined();
      expect(order.customerId).toBe('customer-1');
      expect(order.createdAt).toBeUndefined();
      expect(order.products).toEqual([
        { id: undefined, productId: '100', sku: 'SKU-0001', name: 'Lamp' },
        { id: undefined, productId: '103', sku: 'SKU-0004', name: 'Chair' },
        { id: undefined, productId: '100', sku: 'SKU-0001', name: 'Lamp' },
      ]);
    });

    it('refuses an empty order with ORDER_EMPTY', () => {
      expect(() =>
        OrderModel.place({ customerId: 'customer-1', productIds: [], stock: [] }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_EMPTY',
          message: 'An order must contain at least one product',
        }) as Error,
      );
    });

    it('refuses a product without stock data with ORDER_PRODUCT_NOT_FOUND', () => {
      expect(() =>
        OrderModel.place({ customerId: 'customer-1', productIds: ['999'], stock: [] }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_PRODUCT_NOT_FOUND',
          message: 'Product 999 was not found',
          details: { productId: '999' },
        }) as Error,
      );
    });

    it.each([ProductStatusEnum.DRAFT, ProductStatusEnum.ARCHIVED])(
      'refuses a %s product with ORDER_PRODUCT_NOT_FOUND',
      (status) => {
        expect(() =>
          OrderModel.place({
            customerId: 'customer-1',
            productIds: ['101'],
            stock: [{ productId: '101', sku: 'SKU-0002', name: 'Desk', status, quantity: 5 }],
          }),
        ).toThrow(
          expect.objectContaining({
            code: 'ORDER_PRODUCT_NOT_FOUND',
            message: 'Product 101 was not found',
          }) as Error,
        );
      },
    );

    it('refuses more units than in stock with ORDER_STOCK_INSUFFICIENT', () => {
      expect(() =>
        OrderModel.place({
          customerId: 'customer-1',
          productIds: ['100', '100', '100'],
          stock: [
            {
              productId: '100',
              sku: 'SKU-0001',
              name: 'Lamp',
              status: ProductStatusEnum.ACTIVE,
              quantity: 2,
            },
          ],
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'ORDER_STOCK_INSUFFICIENT',
          message: 'Product 100 has 2 in stock, 3 requested',
          details: { productId: '100', requested: 3, available: 2 },
        }) as Error,
      );
    });

    it('accepts exactly the units in stock', () => {
      const order = OrderModel.place({
        customerId: 'customer-1',
        productIds: ['100', '100'],
        stock: [
          {
            productId: '100',
            sku: 'SKU-0001',
            name: 'Lamp',
            status: ProductStatusEnum.ACTIVE,
            quantity: 2,
          },
        ],
      });

      expect(order.products).toHaveLength(2);
    });
  });

  describe('reconstitute', () => {
    it('restores a stored order with its products', () => {
      const order = OrderModel.reconstitute({
        id: '600',
        customerId: 'customer-1',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        products: [{ id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
      });

      expect(order.id).toBe('600');
      expect(order.customerId).toBe('customer-1');
      expect(order.createdAt).toEqual(new Date('2026-01-03T00:00:00.000Z'));
      expect(order.products).toEqual([
        { id: '600', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
      ]);
    });
  });
});
