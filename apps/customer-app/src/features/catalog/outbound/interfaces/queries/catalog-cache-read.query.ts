import { IPage } from '@acme-libs/toolkit';

import { ICatalogProductRowView } from '../views/catalog-product-row.view';

export interface ICatalogCacheReadQuery {
  page: number;
  limit: number;
  compute: () => Promise<IPage<ICatalogProductRowView>>;
}
