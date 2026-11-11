import type { ICacheLibPort } from '@acme-libs/contracts/cache';

import { ProductCoreCatalogCacheAdapter } from '../product-core-catalog-cache.adapter';

describe('ProductCoreCatalogCacheAdapter', () => {
  let handleDelByPrefix: jest.Mock;
  let adapter: ProductCoreCatalogCacheAdapter;

  beforeEach(() => {
    handleDelByPrefix = jest.fn();
    adapter = new ProductCoreCatalogCacheAdapter({ handleDelByPrefix } as unknown as ICacheLibPort);
  });

  describe('invalidate', () => {
    it('deletes every page of the customer catalog by its prefix', async () => {
      handleDelByPrefix.mockResolvedValue(2);

      await adapter.invalidate();

      expect(handleDelByPrefix).toHaveBeenCalledWith('acme:catalog:v1:');
    });
  });
});
