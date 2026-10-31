import { IPage } from '@acme-libs/toolkit';
import { ICatalogProductRowView } from '../views/catalog-product-row.view';

export interface ICatalogCacheReadQuery {
  page: number;
  size: number;
  compute: () => Promise<IPage<ICatalogProductRowView>>;
}
