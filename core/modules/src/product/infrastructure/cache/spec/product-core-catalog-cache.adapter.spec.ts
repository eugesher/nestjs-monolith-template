import { type ICachePort } from '@acme-libs/contracts/cache';
import { ProductCoreCatalogCacheAdapter } from '../product-core-catalog-cache.adapter';

describe('ProductCoreCatalogCacheAdapter', () => {
  let delByPrefix: jest.Mock;
  let adapter: ProductCoreCatalogCacheAdapter;

  beforeEach(() => {
    delByPrefix = jest.fn();
    adapter = new ProductCoreCatalogCacheAdapter({ delByPrefix } as unknown as ICachePort);
  });

  describe('invalidate', () => {
    it('deletes every page of the customer catalog by its prefix', async () => {
      delByPrefix.mockResolvedValue(2);

      await adapter.invalidate();

      expect(delByPrefix).toHaveBeenCalledWith('acme:catalog:v1:');
    });
  });
});
