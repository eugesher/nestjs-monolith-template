import { ICachePort } from '@acme-libs/contracts/cache';

import { CatalogCacheAdapter } from '../catalog-cache.adapter';

describe('CatalogCacheAdapter', () => {
  let wrap: jest.Mock;
  let adapter: CatalogCacheAdapter;

  beforeEach(() => {
    wrap = jest.fn();
    adapter = new CatalogCacheAdapter(60_000, { wrap } as unknown as ICachePort);
  });

  describe('read', () => {
    it('reads the page window through the cache under its key and TTL', async () => {
      const compute = jest.fn();
      wrap.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      const page = await adapter.read({ page: 2, size: 10, compute });

      expect(page).toEqual({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });
      expect(wrap).toHaveBeenCalledWith('acme:catalog:v1:page:2:size:10', 60_000, compute);
      expect(compute).not.toHaveBeenCalled();
    });
  });
});
