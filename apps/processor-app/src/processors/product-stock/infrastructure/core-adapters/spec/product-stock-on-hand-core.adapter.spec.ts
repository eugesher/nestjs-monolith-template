import { type IProductStockCorePort } from '@acme-core/contracts/product-stock';
import { ProductStockOnHandCoreAdapter } from '../product-stock-on-hand-core.adapter';

describe('ProductStockOnHandCoreAdapter', () => {
  let lock: jest.Mock;
  let adapter: ProductStockOnHandCoreAdapter;

  beforeEach(() => {
    lock = jest.fn();
    adapter = new ProductStockOnHandCoreAdapter({ lock } as unknown as IProductStockCorePort);
  });

  describe('lock', () => {
    it('locks the products through the core module and answers their stock', async () => {
      lock.mockResolvedValue([{ productId: '106', quantity: 0 }]);

      const stock = await adapter.lock({ productIds: ['106'] });

      expect(lock).toHaveBeenCalledWith({ productIds: ['106'] });
      expect(stock).toEqual([{ productId: '106', quantity: 0 }]);
    });
  });
});
