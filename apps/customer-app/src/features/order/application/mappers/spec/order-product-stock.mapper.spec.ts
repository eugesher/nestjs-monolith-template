import { OrderProductStockMapper } from '../order-product-stock.mapper';

describe('OrderProductStockMapper', () => {
  describe('toStock', () => {
    it('joins every found product with its stock', () => {
      const stock = OrderProductStockMapper.toStock(
        [
          { productId: '100', sku: 'SKU-0001', name: 'Lamp' },
          { productId: '101', sku: 'SKU-0002', name: 'Desk' },
        ],
        [
          { productId: '101', quantity: 5 },
          { productId: '100', quantity: 8 },
        ],
      );

      expect(stock).toEqual([
        { productId: '100', sku: 'SKU-0001', name: 'Lamp', quantity: 8 },
        { productId: '101', sku: 'SKU-0002', name: 'Desk', quantity: 5 },
      ]);
    });

    it('counts a product without stock as zero and drops stock without a product', () => {
      const stock = OrderProductStockMapper.toStock(
        [{ productId: '100', sku: 'SKU-0001', name: 'Lamp' }],
        [{ productId: '999', quantity: 4 }],
      );

      expect(stock).toEqual([{ productId: '100', sku: 'SKU-0001', name: 'Lamp', quantity: 0 }]);
    });
  });

  describe('toMovements', () => {
    it('turns every placed product into a movement of its order product', () => {
      const movements = OrderProductStockMapper.toMovements([
        { id: '601', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
        { id: '602', productId: '100', sku: 'SKU-0001', name: 'Lamp' },
      ]);

      expect(movements).toEqual([
        { productId: '100', orderProductId: '601' },
        { productId: '100', orderProductId: '602' },
      ]);
    });
  });
});
