import type { ICacheLibPort } from '@acme-libs/contracts/cache';

import { CatalogCacheAdapter } from '../catalog-cache.adapter';

describe('CatalogCacheAdapter', () => {
  let handleWrap: jest.Mock;
  let adapter: CatalogCacheAdapter;

  beforeEach(() => {
    handleWrap = jest.fn();
    adapter = new CatalogCacheAdapter({ handleWrap } as unknown as ICacheLibPort);
  });

  describe('read', () => {
    it('reads the page window through the cache under its key and TTL', async () => {
      const compute = jest.fn();
      handleWrap.mockResolvedValue({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });

      const page = await adapter.read({ page: 2, limit: 10, ttlMs: 60_000, compute });

      expect(page).toEqual({ page: 2, count: 0, pageCount: 0, total: 0, data: [] });
      expect(handleWrap).toHaveBeenCalledWith({
        key: 'acme:catalog:v1:page:2:limit:10',
        ttlMs: 60_000,
        compute,
      });
      expect(compute).not.toHaveBeenCalled();
    });
  });
});
