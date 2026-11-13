import type { ICacheLibPort } from '@acme-libs/contracts/cache';

import { ProductCatalogCacheAdapter } from '../product-catalog-cache.adapter';

describe('ProductCatalogCacheAdapter', () => {
  let handleDelByPrefix: jest.Mock;
  let adapter: ProductCatalogCacheAdapter;

  beforeEach(() => {
    handleDelByPrefix = jest.fn();
    adapter = new ProductCatalogCacheAdapter({ handleDelByPrefix } as unknown as ICacheLibPort);
  });

  describe('invalidate', () => {
    it('deletes every page of the customer catalog by its prefix', async () => {
      handleDelByPrefix.mockResolvedValue(2);

      await adapter.invalidate();

      expect(handleDelByPrefix).toHaveBeenCalledWith('acme:catalog:v1:');
    });

    it('lets a failed delete reject', async () => {
      handleDelByPrefix.mockRejectedValue(new Error('redis is down'));

      await expect(adapter.invalidate()).rejects.toThrow('redis is down');
    });
  });
});
