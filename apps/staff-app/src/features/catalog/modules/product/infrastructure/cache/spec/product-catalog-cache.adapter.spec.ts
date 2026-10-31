import { type ICachePort } from '@acme-libs/contracts/cache';
import { ProductCatalogCacheAdapter } from '../product-catalog-cache.adapter';

describe('ProductCatalogCacheAdapter', () => {
  let delByPrefix: jest.Mock;
  let adapter: ProductCatalogCacheAdapter;

  beforeEach(() => {
    delByPrefix = jest.fn();
    adapter = new ProductCatalogCacheAdapter({ delByPrefix } as unknown as ICachePort);
  });

  describe('invalidate', () => {
    it('deletes every page of the customer catalog by its prefix', async () => {
      delByPrefix.mockResolvedValue(2);

      await adapter.invalidate();

      expect(delByPrefix).toHaveBeenCalledWith('acme:catalog:v1:');
    });
  });
});
