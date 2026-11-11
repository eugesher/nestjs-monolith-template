import type { ICatalogCacheProductListView } from '../views/catalog-cache.view';

export interface ICatalogCacheProductListReadCommand {
  page: number;
  limit: number;
  ttlMs: number;
  compute: () => Promise<ICatalogCacheProductListView>;
}
