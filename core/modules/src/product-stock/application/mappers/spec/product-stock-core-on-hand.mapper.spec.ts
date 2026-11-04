import { ProductStockCoreOnHandMapper } from '../product-stock-core-on-hand.mapper';

describe('ProductStockCoreOnHandMapper', () => {
  describe('toViews', () => {
    it('answers the on-hand of every product in the order of the ids, as a number', () => {
      const views = ProductStockCoreOnHandMapper.toViews(
        ['103', '100'],
        [
          { productId: '100', quantity: '8' },
          { productId: '103', quantity: 2 },
        ],
      );

      expect(views).toEqual([
        { productId: '103', quantity: 2 },
        { productId: '100', quantity: 8 },
      ]);
    });

    it('answers zero for a product without stock rows', () => {
      const views = ProductStockCoreOnHandMapper.toViews(
        ['100', '103'],
        [{ productId: '100', quantity: '8' }],
      );

      expect(views).toEqual([
        { productId: '100', quantity: 8 },
        { productId: '103', quantity: 0 },
      ]);
    });
  });
});
