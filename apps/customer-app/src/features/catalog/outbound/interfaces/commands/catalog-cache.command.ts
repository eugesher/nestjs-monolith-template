import { ICatalogCacheProductListView } from '../views/catalog-cache.view';

export interface ICatalogCacheProductListReadCommand {
  page: number;
  limit: number;
  compute: () => Promise<ICatalogCacheProductListView>;
}
