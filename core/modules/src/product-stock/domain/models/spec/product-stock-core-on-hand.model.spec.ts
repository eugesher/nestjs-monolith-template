import { ProductStockCoreOnHandModel } from '../product-stock-core-on-hand.model';

describe('ProductStockCoreOnHandModel', () => {
  describe('toSnapshot', () => {
    it('answers the on-hand of every product in the order of the ids, as a number', () => {
      const onHand = ProductStockCoreOnHandModel.reconstitute({
        productIds: ['103', '100'],
        sums: [
          { productId: '100', quantity: '8' },
          { productId: '103', quantity: 2 },
        ],
      });

      expect(onHand.toSnapshot()).toEqual([
        { productId: '103', quantity: 2 },
        { productId: '100', quantity: 8 },
      ]);
    });

    it('answers zero for a product without stock rows', () => {
      const onHand = ProductStockCoreOnHandModel.reconstitute({
        productIds: ['100', '103'],
        sums: [{ productId: '100', quantity: '8' }],
      });

      expect(onHand.toSnapshot()).toEqual([
        { productId: '100', quantity: 8 },
        { productId: '103', quantity: 0 },
      ]);
    });
  });
});
