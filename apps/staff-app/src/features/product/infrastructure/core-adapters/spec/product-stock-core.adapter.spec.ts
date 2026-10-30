import { ProductStockCoreAdapter } from '../product-stock-core.adapter';

describe('ProductStockCoreAdapter', () => {
  let lock: jest.Mock;
  let move: jest.Mock;
  let adapter: ProductStockCoreAdapter;

  beforeEach(() => {
    lock = jest.fn().mockResolvedValue([{ productId: '12', quantity: 10 }]);
    move = jest.fn().mockResolvedValue({
      productStockIds: ['700'],
      stock: [{ productId: '12', quantity: 15 }],
    });
    adapter = new ProductStockCoreAdapter({ lock, move });
  });

  describe('lock', () => {
    it('locks the one product through the core module and keeps its stock to itself', async () => {
      const result = await adapter.lock({ productId: '12' });

      expect(lock).toHaveBeenCalledWith({ productIds: ['12'] });
      expect(result).toBeUndefined();
    });
  });

  describe('restock', () => {
    it('adds the units without an order line and answers the new row and the stock', async () => {
      const view = await adapter.restock({ productId: '12', quantity: 5 });

      expect(move).toHaveBeenCalledWith({
        kind: 'add',
        movements: [{ productId: '12', quantity: 5, orderProductId: null }],
      });
      expect(view).toEqual({ productStockId: '700', quantity: 15 });
    });
  });
});
