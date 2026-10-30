import { ProductStatusEnum } from '@acme-libs/kernel';
import { OrderStockMapper } from '../order-stock.mapper';

describe('OrderStockMapper', () => {
  describe('toStock', () => {
    it('joins every found product with its stock', () => {
      const stock = OrderStockMapper.toStock(
        [
          { productId: '100', sku: 'SKU-0001', name: 'Lamp', status: ProductStatusEnum.ACTIVE },
          { productId: '101', sku: 'SKU-0002', name: 'Desk', status: ProductStatusEnum.DRAFT },
        ],
        [
          { productId: '101', quantity: 5 },
          { productId: '100', quantity: 8 },
        ],
      );

      expect(stock).toEqual([
        {
          productId: '100',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          quantity: 8,
        },
        {
          productId: '101',
          sku: 'SKU-0002',
          name: 'Desk',
          status: ProductStatusEnum.DRAFT,
          quantity: 5,
        },
      ]);
    });

    it('counts a product without stock as zero and drops stock without a product', () => {
      const stock = OrderStockMapper.toStock(
        [{ productId: '100', sku: 'SKU-0001', name: 'Lamp', status: ProductStatusEnum.ACTIVE }],
        [{ productId: '999', quantity: 4 }],
      );

      expect(stock).toEqual([
        {
          productId: '100',
          sku: 'SKU-0001',
          name: 'Lamp',
          status: ProductStatusEnum.ACTIVE,
          quantity: 0,
        },
      ]);
    });
  });
});
