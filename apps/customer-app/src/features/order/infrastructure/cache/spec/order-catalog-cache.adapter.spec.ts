import { type ICachePort } from '@acme-libs/contracts/cache';
import { OrderCatalogCacheAdapter } from '../order-catalog-cache.adapter';

describe('OrderCatalogCacheAdapter', () => {
  let delByPrefix: jest.Mock;
  let adapter: OrderCatalogCacheAdapter;

  beforeEach(() => {
    delByPrefix = jest.fn();
    adapter = new OrderCatalogCacheAdapter({ delByPrefix } as unknown as ICachePort);
  });

  describe('invalidate', () => {
    it('deletes every page of the catalog by its prefix', async () => {
      delByPrefix.mockResolvedValue(2);

      await adapter.invalidate();

      expect(delByPrefix).toHaveBeenCalledWith('acme:catalog:v1:');
    });
  });
});
